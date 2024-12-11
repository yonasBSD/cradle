from .utils import KnowledgeGraphTestCase
from django.urls import reverse
from user.models import CradleUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.parsers import JSONParser
import io
from entries.models import Entry
from access.enums import AccessType
from access.models import Access
from notes.models import Note, Relation

from collections import Counter


def bytes_to_json(data):
    return JSONParser().parse(io.BytesIO(data))


class GetKnowledgeGraphTest(KnowledgeGraphTestCase):
    def setUp(self):
        super().setUp()
        self.user = CradleUser.objects.create_user(
            username="user", password="user", email="alabala@gmail.com"
        )
        self.user_token = str(AccessToken.for_user(self.user))
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.user_token}"}

        self.entity2 = Entry.objects.create(name="2", entry_class=self.entryclass1)
        self.entity1 = Entry.objects.create(name="1", entry_class=self.entryclass1)
        self.artifact = Entry.objects.create(name="1", entry_class=self.entryclass2)

        self.artifact.save()
        self.entity1.save()
        self.entity2.save()

        self.note = Note.objects.create(content="")
        self.note.entries.set([self.entity1, self.artifact])

        self.access = Access.objects.create(
            user=self.user, entity=self.entity1, access_type=AccessType.READ_WRITE
        )
        self.access.save()
        self.note.save()
        self.relation = Relation(
            src_entry=self.entity1, dst_entry=self.artifact, note=self.note
        )
        self.relation.save()

    def test_get_knowledge_graph_not_authenticated(self):
        response = self.client.get(reverse("knowledge_graph_list"))
        self.assertEqual(response.status_code, 401)

    def test_get_knowledge_graph_successful(self):
        response = self.client.get(reverse("knowledge_graph_list"), **self.headers)

        graph = bytes_to_json(response.content)
        expected_entries = [
            str(entry.id) for entry in Entry.objects.exclude(id=self.entity2.pk)
        ]
        entries = [entry["id"] for entry in graph["entries"]]
        expected_links = [tuple(sorted((str(self.artifact.id), str(self.entity1.id))))]

        with self.subTest("Test status code"):
            self.assertEqual(response.status_code, 200)
        with self.subTest("Test correct entries"):
            self.assertEqual(Counter(entries), Counter(expected_entries))
        with self.subTest("Test correct links"):
            self.assertLinksEqual(graph["links"], expected_links)
