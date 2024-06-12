from django.db import models
from django.db.models import Count

from entities.enums import EntityType
from entities.models import Entity
from user.models import CradleUser
from access.models import Access
from access.enums import AccessType
from django.db.models import Case, When

from typing import List


class NoteManager(models.Manager):

    def get_all_notes(self, entity_id: int) -> models.QuerySet:
        """Gets the notes of an entity ordered by timestamp in descending order

        Args:
            entity_id (int): The id of the entity

        Returns:
            models.QuerySet: The notes of the entity
                ordered by timestamp in descending order

        """
        return self.get_queryset().filter(entities__id=entity_id).order_by("-timestamp")

    def get_entities_from_notes(
        self,
        notes: models.QuerySet,
    ) -> models.QuerySet:
        """Gets the entities from a QuerySet of notes

        Args:
            notes: The QuerySet containing the notes
            entity_type: The type of the entity to filter by

        Returns:
            models.QuerySet: The entities referenced by the notes
        """
        entities = Entity.objects.filter(note__in=notes).distinct()

        return entities

    def get_accessible_notes(self, user: CradleUser, entity_id: int) -> models.QuerySet:
        """Get the notes of a case that the user has access to

        Args:
            user: The user whose access is being checked
            entity_id: The id of the entiy whose notes are being retrieved

        Returns:
            QuerySet: The notes of the case that the user has access to
        """

        if user.is_superuser:
            return self.get_all_notes(entity_id)

        inaccessible_notes = self.get_inaccessible_notes(user, entity_id).values_list(
            "id", flat=True
        )

        return (
            Entity.objects.get(id=entity_id)
            .note_set.exclude(id__in=inaccessible_notes)
            .order_by("-timestamp")
            .distinct()
        )

    def get_inaccessible_notes(self, user, entity_id):
        """Get the notes of a case that the user does not have access to

        Args:
            user: The user whose access is being checked
            entity_id: The id of the entiy whose notes are being retrieved

        Returns:
            QuerySet: The notes of the case that the user does not have access to
        """
        if user.is_superuser:
            return self.get_queryset().none()

        accessible_cases = Access.objects.filter(
            user=user, access_type__in=[AccessType.READ_WRITE, AccessType.READ]
        ).values_list("case_id", flat=True)

        inaccessible_cases = (
            Entity.objects.filter(type=EntityType.CASE)
            .exclude(id__in=accessible_cases)
            .values_list("id", flat=True)
        )

        inaccessible_notes = self.get_queryset().filter(
            entities__id__in=inaccessible_cases, entities__type=EntityType.CASE
        )

        return (
            Entity.objects.get(id=entity_id)
            .note_set.filter(id__in=inaccessible_notes)
            .distinct()
        )

    def delete_unreferenced_entities(self) -> None:
        """Deletes entities of type ENTRY and METADATA that
        are not referenced by any notes.

        This function filters out entities of type ENTRY and METADATA
        that have no associated notes and deletes them from the database.
        It performs the following steps:

        1. Filter entities by type (ENTRY and METADATA).
        2. Annotate each entity with the count of related notes.
        3. Filter entities to keep only those with no associated notes.
        4. Delete the filtered unreferenced entities from the database.

        Returns:
            None: This function does not return any value.
        """
        Entity.objects.filter(
            type__in=[EntityType.ENTRY, EntityType.METADATA]
        ).annotate(note_count=Count("note")).filter(note_count=0).delete()

    def get_in_order(self, note_ids: List) -> models.QuerySet:
        """Gets the notes in the order specified by the given list of note IDs.

        Args:
            note_ids (List[int]): A list of note IDs specifying the order in
                which the notes should be fetched.

        Returns:
            models.QuerySet: A QuerySet of Note objects ordered according to
                the specified list of note IDs.
        """
        ordering = Case(*[When(id=id, then=pos) for pos, id in enumerate(note_ids)])
        return self.get_queryset().filter(id__in=note_ids).order_by(ordering)
