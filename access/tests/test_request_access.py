from django.urls import reverse
from entries.models import Entry
from rest_framework_simplejwt.tokens import AccessToken

from entries.enums import EntryType
from user.models import CradleUser
from ..models import Access
from ..enums import AccessType
from .utils import AccessTestEntity
from notifications.models import AccessRequestNotification

import uuid


class RequestAccessTest(AccessTestEntity):

    def setUp(self):
        super().setUp()

        self.users = [
            CradleUser.objects.create_user(
                username=f"user{id}", password="user", email=f"b{id}@c.d"
            )
            for id in range(4)
        ]
        self.users.append(
            CradleUser.objects.create_superuser(
                username="admin", password="admin", email="c@d.e"
            )
        )

        self.entity = Entry.objects.create(name="entity", type=EntryType.ENTITY)

        Access.objects.create(
            user=self.users[1], entity=self.entity, access_type=AccessType.READ_WRITE
        )
        Access.objects.create(
            user=self.users[2], entity=self.entity, access_type=AccessType.READ
        )
        Access.objects.create(
            user=self.users[3], entity=self.entity, access_type=AccessType.NONE
        )

        self.tokens_users = [
            str(AccessToken.for_user(self.users[id])) for id in range(5)
        ]

        self.headers = [
            {"HTTP_AUTHORIZATION": f"Bearer {self.tokens_users[id]}"} for id in range(5)
        ]

    def test_request_access_not_authenticated(self):
        response = self.client.post(
            reverse(
                "request_access",
                kwargs={"entity_id": self.entity.id},
            )
        )

        self.assertEqual(response.status_code, 401)

    def test_request_access_entity_does_not_exist(self):
        response = self.client.post(
            reverse(
                "request_access",
                kwargs={"entity_id": uuid.uuid4()},
            ),
            **self.headers[0],
        )

        self.assertEqual(response.status_code, 404)

    def test_request_access_user_has_read_write_access(self):
        response = self.client.post(
            reverse(
                "request_access",
                kwargs={"entity_id": self.entity.id},
            ),
            **self.headers[1],
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(AccessRequestNotification.objects.count(), 0)

    def test_request_access_user_is_superuser(self):
        response = self.client.post(
            reverse(
                "request_access",
                kwargs={"entity_id": self.entity.id},
            ),
            **self.headers[4],
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(AccessRequestNotification.objects.count(), 0)

    def test_request_access_entity_does_not_have_read_write_access(self):
        response = self.client.post(
            reverse(
                "request_access",
                kwargs={"entity_id": self.entity.id},
            ),
            **self.headers[0],
        )

        self.assertEqual(response.status_code, 200)

        self.assertTrue(
            AccessRequestNotification.objects.filter(
                user_id=self.users[4].id,
                requesting_user=self.users[0],
                entity=self.entity,
                message="User user0 has requested access for entity entity",
            )
        )
        self.assertTrue(
            AccessRequestNotification.objects.filter(
                user_id=self.users[1].id,
                requesting_user=self.users[0],
                entity=self.entity,
                message="User user0 has requested access for entity entity",
            )
        )
        self.assertEqual(AccessRequestNotification.objects.count(), 2)
