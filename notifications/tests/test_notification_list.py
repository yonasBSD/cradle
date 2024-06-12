from .utils import NotificationsTestCase
from user.models import CradleUser
from entities.models import Entity
from entities.enums import EntityType
from notifications.models import MessageNotification, AccessRequestNotification
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from django.urls import reverse


class NotificationListTest(NotificationsTestCase):
    def setUp(self):
        self.maxDiff = None
        super().setUp()
        self.client = APIClient()

        self.user = CradleUser.objects.create_user(
            username="user", password="password", is_staff=False
        )
        self.other_user = CradleUser.objects.create_user(
            username="other_user", password="password", is_staff=False
        )
        self.case = Entity.objects.create(name="Case", type=EntityType.CASE)

        self.token = str(AccessToken.for_user(self.user))
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_get_notifications_not_authenticated(self):
        response = self.client.get(reverse("notification_list"))

        self.assertEqual(response.status_code, 401)

    def test_get_notifications_successfully(self):
        message_user = MessageNotification.objects.create(
            user=self.user, message="Test message"
        )
        MessageNotification.objects.create(
            user=self.other_user, message="Test message other user"
        )
        access_request_user = AccessRequestNotification.objects.create(
            user=self.user,
            requesting_user=self.other_user,
            case=self.case,
            message="Access Request",
        )
        AccessRequestNotification.objects.create(
            user=self.other_user,
            requesting_user=self.user,
            case=self.case,
            message="Access Request",
        )

        response = self.client.get(
            reverse("notification_list"),
            **self.headers,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

        expected_response_message_notification = {
            "id": message_user.id,
            "message": message_user.message,
            "timestamp": message_user.timestamp.isoformat().replace("+00:00", "Z"),
            "notification_type": "message_notification",
        }

        expected_response_access_request_notification = {
            "id": access_request_user.id,
            "message": access_request_user.message,
            "notification_type": "request_access_notification",
            "case_id": access_request_user.case.id,
            "timestamp": access_request_user.timestamp.isoformat().replace(
                "+00:00", "Z"
            ),
            "requesting_user_id": access_request_user.requesting_user.id,
        }

        self.assertCountEqual(
            [
                expected_response_access_request_notification,
                expected_response_message_notification,
            ],
            response.json(),
        )

        self.assertTrue(
            response.json()[0]["timestamp"] > response.json()[1]["timestamp"]
        )
