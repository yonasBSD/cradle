import uuid
from typing import Optional, Union

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models.fields.related import ReverseManyToOneDescriptor

from .enums import EventType
from .managers import EventLogManager


class EventLog(models.Model):
    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    timestamp: models.DateTimeField = models.DateTimeField(
        auto_now_add=True
    )  # Logs creation time automatically
    type: models.CharField = models.CharField(
        choices=EventType.choices, null=False
    )  # Queue type of event

    user: models.ForeignKey = models.ForeignKey(
        "user.CradleUser", on_delete=models.CASCADE, related_name="event_logs"
    )
    details: Optional[dict] = models.CharField(blank=True, null=True)

    # Reference to the log that triggered this event, if applicable
    src_log: Optional[models.ForeignKey] = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="propagated_logs",
    )

    # Generic relation fields
    content_type: models.ForeignKey = models.ForeignKey(
        ContentType, on_delete=models.CASCADE
    )
    object_id: models.CharField = models.CharField()
    content_object: Union[models.Model, None] = GenericForeignKey(
        "content_type", "object_id"
    )

    class Meta:
        ordering = ["-timestamp"]  # Orders by most recent events first

    objects = EventLogManager()  # Assign custom manager

    def __str__(self):
        return f'<"{self.type}" object [{self.content_type}]({self.object_id}) by {self.user} on {self.timestamp}>'

    def propagate(self, obj):
        """
        Create a propagated log entry with reference to the originating log (src_log).
        """
        return EventLog.objects.create(
            user=self.user,
            content_object=obj,
            type=EventType.EDIT,
            src_log=self,  # Set the originating log if provided
        )


class LoggableModelMixin:
    def _linked_loggables(self):
        for field in self._meta.get_fields():
            if isinstance(field, (models.ForeignKey, models.OneToOneField)):
                related_instance = getattr(self, field.name, None)
                if isinstance(related_instance, LoggableModelMixin):
                    yield related_instance

            elif isinstance(field, models.ManyToManyField):
                related_manager = getattr(self, field.name)
                if issubclass(field.model, LoggableModelMixin):
                    for related_instance in related_manager.all():
                        yield related_instance

            elif isinstance(field, ReverseManyToOneDescriptor):  # One-to-many relation
                related_manager = getattr(self, field.get_accessor_name())

                if issubclass(field.model, LoggableModelMixin):
                    for related_instance in related_manager.all():
                        yield related_instance

    def _propagate_log(self, log):
        for i in self._linked_loggables():
            i.propagate_from(log)

    def propagate_from(self, log: EventLog):
        log.propagate(self).save()

    def _save_log(self, log):
        log.save()
        self._propagate_log(log)
        return log

    def log_create(self, user, details=None):
        return self._save_log(
            EventLog(
                user=user, content_object=self, type=EventType.CREATE, details=details
            )
        )

    def log_delete(self, user, details=None):
        return self._save_log(
            EventLog(
                user=user, content_object=self, type=EventType.DELETE, details=details
            )
        )

    def log_edit(self, user, details=None):
        return self._save_log(
            EventLog(
                user=user, content_object=self, type=EventType.EDIT, details=details
            )
        )

    def log_fetch(self, user, details=None):
        # Fetch events are not propagated
        return EventLog.objects.create(
            user=user, content_object=self, type=EventType.FETCH
        )

    def __repr__(self):
        return f"<{self.__class__.__name__}:{self.pk}>"
