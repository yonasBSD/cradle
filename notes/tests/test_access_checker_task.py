from entities.models import Entity
from entities.enums import EntityType
from notes.utils.access_checker_task import AccessCheckerTask
from user.models import CradleUser
from access.models import Access
from access.enums import AccessType
from ..exceptions import NoAccessToEntitiesException
from .utils import NotesTestCase


class AccessCheckerTaskTest(NotesTestCase):

    def setUp(self):
        super().setUp()

        self.user = CradleUser.objects.create_user(
            username="user", password="user", email="alabala@gmail.com"
        )

        self.case1 = Entity.objects.create(name="case1", type=EntityType.CASE)
        self.case2 = Entity.objects.create(name="case2", type=EntityType.CASE)
        self.actor = Entity.objects.create(name="actor", type=EntityType.ACTOR)

        Access.objects.create(
            user=self.user, case=self.case1, access_type=AccessType.READ_WRITE
        )
        Access.objects.create(
            user=self.user, case=self.case2, access_type=AccessType.READ
        )

        self.referenced_entities = {}
        self.entity_types = ["actor", "case", "entry", "metadata"]
        for t in self.entity_types:
            self.referenced_entities[t] = set()
        self.referenced_entities["actor"] = {self.actor}

    def test_has_access_to_referenced_cases(self):
        self.referenced_entities["case"] = {self.case1}

        newly_returned_entities = AccessCheckerTask(self.user).run(
            self.referenced_entities
        )
        self.assertEqual(self.referenced_entities, newly_returned_entities)

    def test_does_not_have_access_to_referenced_cases(self):
        self.referenced_entities["case"] = {self.case1, self.case2}

        self.assertRaises(
            NoAccessToEntitiesException,
            lambda: AccessCheckerTask(self.user).run(self.referenced_entities),
        )
