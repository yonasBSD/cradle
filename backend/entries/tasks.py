from celery import group, shared_task
from django.contrib.contenttypes.models import ContentType
from entries.enums import EntryType
from core.decorators import debounce_task, distributed_lock
from entries.models import Edge, Entry, Relation
from entries.enums import RelationReason
from notes.processor.task_scheduler import TaskScheduler
from notes.utils import calculate_acvec
from notes.tasks import propagate_acvec
from intelio.tasks import propagate_acvec as propagate_digest_acvec
from django.db import transaction
from django.db import connection

from notes.models import Note
from notes.markdown.to_markdown import remap_links

import numpy as np

from django.contrib.gis.geos import Point
from management.settings import cradle_settings
from user.models import CradleUser

# import networkx as nx
# from pyforceatlas2 import ForceAtlas2
# from networkx.drawing.nx_agraph import to_agraph


@shared_task
@distributed_lock("update_accesses_{entry_id}", timeout=3600)
def update_accesses(entry_id):
    entry = Entry.objects.get(id=entry_id)
    entry.status = {"status": "warning", "message": "Updating access controls"}
    entry.save()

    notes = entry.notes.all()
    update_notes = []

    for note in notes:
        newvec = calculate_acvec(
            note.entries.filter(entry_class__type=EntryType.ENTITY)
        )

        if newvec != note.access_vector:
            note.access_vector = newvec
            update_notes.append(note)

    if update_notes:
        note_model = update_notes[0].__class__
        note_model.objects.bulk_update(update_notes, ["access_vector"])

    digest_ids = entry.digests.all().values_list("id", flat=True)
    digest_tasks = []

    for digest in digest_ids:
        digest_tasks.append(propagate_digest_acvec.si(digest))

    # Reset the status field.
    entry.status = None
    entry.save()

    g_notes = group(*[propagate_acvec.si(n.id) for n in update_notes])
    g_digests = group(*[propagate_digest_acvec.si(n.id) for n in update_notes])

    transaction.on_commit(lambda: g_notes.apply_async())
    transaction.on_commit(lambda: g_digests.apply_async())

    return f"Updated {len(update_notes)} notes"


@shared_task
def remap_notes_task(note_ids, mapping_eclass, mapping_entry, user_id=None):
    notes = list(Note.objects.filter(id__in=note_ids))
    if user_id:
        user = CradleUser.objects.get(id=user_id)
    else:
        user = None

    mapping_entry = {tuple(k.split(":", 1)): v for k, v in mapping_entry.items()}

    for note in notes:
        content = remap_links(note.content, mapping_eclass, mapping_entry)
        TaskScheduler(user, content=content).run_pipeline(note, validate=False)


@shared_task
def scan_for_children(entry_ids, content_type_id, content_id):
    content_type = ContentType.objects.get(id=content_type_id)
    content_object = content_type.get_object_for_this_type(id=content_id)

    entries = Entry.objects.filter(id__in=entry_ids)

    Relation.objects.filter(
        reason=RelationReason.CONTAINS,
        content_type=content_type,
        object_id=content_id,
    ).delete()

    relations = []

    created = False

    for entry in entries:
        matches = {}
        for child in entry.entry_class.children.all():
            matches[child] = child.match(entry.name)

        for k, v in matches.items():
            for i in v:
                e, new = Entry.objects.get_or_create(name=i, entry_class=k)
                created = created or new
                rel = Relation(
                    e1=e,
                    e2=entry,
                    reason=RelationReason.CONTAINS,
                    inherit_av=True,
                    access_vector=(
                        getattr(content_object, "access_vector")
                        if hasattr(content_object, "access_vector")
                        else 1
                    ),
                    content_object=content_object,
                )
                relations.append(rel)

    if len(relations) > 0:
        Relation.objects.bulk_create(relations)

    refresh_edges_materialized_view.apply_async(simulate=created)


@shared_task
def simulate_graph():
    from graph_tool.all import Graph, sfdp_layout

    # Assign random coordinates to entries with no location
    null_location_entries = Entry.objects.filter(location__isnull=True)
    if null_location_entries.exists():
        random_coords = np.random.uniform(
            -100, 100, size=(null_location_entries.count(), 2)
        )
        for entry, (x, y) in zip(null_location_entries, random_coords):
            entry.location = Point(x, y, srid=0)
        Entry.objects.bulk_update(null_location_entries, ["location"])

    # Build directed graph using graph_tool
    g = Graph()
    # Create a mapping from entry id to graph vertex
    vertex_map = {}
    entries = list(Entry.objects.all())
    for entry in entries:
        v = g.add_vertex()
        vertex_map[entry.id] = v

    # Add edges from Edge objects
    entry_ids = set(vertex_map.keys())
    rels = Edge.objects.distinct("src", "dst").remove_mirrors()
    for rel in rels.only("src", "dst"):
        src_id = rel.src
        dst_id = rel.dst
        if src_id in entry_ids and dst_id in entry_ids:
            g.add_edge(vertex_map[src_id], vertex_map[dst_id])

    pos = sfdp_layout(
        g,
        K=cradle_settings.graph.K,  # Edge length constant
        p=cradle_settings.graph.p,  # Repulsive force strength
        theta=cradle_settings.graph.theta,  # Tradeoff between speed and precision
        max_level=cradle_settings.graph.max_level,  # Enable multilevel optimization
        epsilon=cradle_settings.graph.epsilon,  # Convergence precision
        r=cradle_settings.graph.r,
        max_iter=cradle_settings.graph.max_iter,
    )

    coords = np.array([pos[vertex_map[entry.id]] for entry in entries])

    # Get min and max for each dimension
    min_vals = coords.min(axis=0)
    max_vals = coords.max(axis=0)

    # Prevent division by zero by setting range to 1 where min == max
    ranges = np.where(max_vals - min_vals == 0, 1, max_vals - min_vals)

    # Scale to [-2000, 2000]
    scaled_coords = (coords - min_vals) / ranges * 4000 - 2000

    # Assign scaled positions to entries
    for entry, (x, y) in zip(entries, scaled_coords):
        entry.location = Point(float(x), float(y), srid=0)

    result = Entry.objects.bulk_update(entries, ["location"])
    return result


@debounce_task(timeout=180)
@shared_task
def refresh_edges_materialized_view(simulate=False):
    """
    Refreshes the 'edges' materialized view concurrently.

    Ensure that a unique index (e.g., on 'id') exists on the view, like:

        CREATE UNIQUE INDEX idx_edges_id ON edges(id);

    This allows the materialized view to be refreshed concurrently,
    which minimizes downtime for reads.
    """
    with connection.cursor() as cursor:
        cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY edges;")

    entryids = Entry.objects.exclude(entry_class__subtype="virtual").values_list(
        "id", flat=True
    )
    degrees = [None for _ in range(len(entryids))]

    for i, entryid in enumerate(entryids):
        degrees[i] = Edge.objects.filter(src=entryid).count()

    Entry.objects.bulk_update(
        [Entry(id=id, degree=degree) for id, degree in zip(entryids, degrees)],
        ["degree"],
    )

    Entry.objects.filter(entry_class__subtype="virtual").update(degree=0)

    if simulate:
        simulate_graph.apply_async()


@shared_task
def delete_hanging_artifacts():
    return Entry.artifacts.unreferenced().delete()[0]
