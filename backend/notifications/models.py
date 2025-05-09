from django.db import models
from django_lifecycle import AFTER_CREATE, LifecycleModel, hook
from mail.models import AccessRequestMail, NewUserNotificationMail
from mail.models import ReportReadyMail
from mail.models import ReportErrorMail
from mail.models import AccessGrantedMail
from user.models import CradleUser
from entries.models import Entry
from model_utils.managers import InheritanceManager
import uuid


class MessageNotification(LifecycleModel):
    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    message: models.CharField = models.CharField()
    user: models.ForeignKey = models.ForeignKey(CradleUser, on_delete=models.CASCADE)
    timestamp: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    is_unread: models.BooleanField = models.BooleanField(default=True)
    is_marked_unread: models.BooleanField = models.BooleanField(default=False)

    objects: InheritanceManager = InheritanceManager()

    @property
    def get_mail(self):
        return None

    @hook(AFTER_CREATE)
    def send_mail(self, *args, **kwargs):
        if self.get_mail:
            self.get_mail.dispatch()


class AccessGrantedNotification(MessageNotification):
    entity: models.ForeignKey = models.ForeignKey(Entry, on_delete=models.CASCADE)

    @property
    def get_mail(self):
        return AccessGrantedMail(self.user, self.entity)


class AccessRequestNotification(MessageNotification):
    requesting_user: models.ForeignKey = models.ForeignKey(
        CradleUser, on_delete=models.CASCADE
    )
    entity: models.ForeignKey = models.ForeignKey(Entry, on_delete=models.CASCADE)

    @property
    def get_mail(self):
        return AccessRequestMail(self.user, self.requesting_user, self.entity)


class NewUserNotification(MessageNotification):
    new_user: models.ForeignKey = models.ForeignKey(
        CradleUser, on_delete=models.CASCADE
    )

    @property
    def get_mail(self):
        return NewUserNotificationMail(self.user, self.new_user)


class ReportRenderNotification(MessageNotification):
    published_report = models.ForeignKey(
        "publish.PublishedReport",
        on_delete=models.CASCADE,
        related_name="render_notifications",
    )

    @property
    def get_mail(self):
        return ReportReadyMail(self.user, self.published_report)


class ReportProcessingErrorNotification(MessageNotification):
    published_report = models.ForeignKey(
        "publish.PublishedReport",
        on_delete=models.CASCADE,
        related_name="processing_error_notifications",
    )
    error_message = models.TextField(blank=True, null=True)

    @property
    def get_mail(self):
        return ReportErrorMail(self.user, self.published_report, self.error_message)
