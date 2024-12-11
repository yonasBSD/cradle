from typing import Iterable

from entries.models import Entry
from .utils import Link
from rest_framework.exceptions import APIException
from django.conf import settings


class InvalidRequestException(APIException):
    status_code = 400
    default_detail = "The query format is invalid."


class NoteIsEmptyException(APIException):
    status_code = 400
    default_detail = "The note should not be empty."


class NotEnoughReferencesException(APIException):
    status_code = 400

    default_detail = (
        f"Note does not reference at least {settings.MIN_ENTITY_COUNT_PER_NOTE}"
        + f"entity and at least {settings.MIN_ENTRY_COUNT_PER_NOTE} entries."
    )


class NoteDoesNotExistException(APIException):
    status_code = 404
    default_detail = "The referenced note does not exist or you do not have access."


class EntryClassesDoNotExistException(APIException):
    status_code = 404

    def __init__(self, classes: Iterable[str], *args, **kwargs) -> None:
        assert len(classes) > 0

        self.default_detail = (
            "Some of the referenced entry classes do not exist:\n" + ",\n".join(classes)
        )
        super().__init__(*args, **kwargs)


class EntriesDoNotExistException(APIException):
    status_code = 404

    def __init__(self, links: Iterable[Link], *args, **kwargs) -> None:
        assert len(links) > 0

        self.default_detail = (
            "Some of the referenced entries do not exist or"
            + "you don't have the right permissions to access them:\n"
        )

        for i in links:
            self.default_detail += f"({i.class_subtype}: {i.name})\n"

        self.default_detail = self.default_detail[:-1]
        super().__init__(*args, **kwargs)


class NoAccessToEntriesException(APIException):
    status_code = 404

    def __init__(self, links: Iterable[Entry], *args, **kwargs) -> None:
        assert len(links) > 0

        self.default_detail = (
            "Some of the referenced entries do not exist or you don't"
            + "have the right permissions to access them:\n"
        )

        for i in links:
            self.default_detail += f"({i.entry_class.subtype}: {i.name})\n"

        self.default_detail = self.default_detail[:-1]
        super().__init__(*args, **kwargs)


class NoteNotPublishableException(APIException):
    status_code = 403
    default_detail = "The note is not publishable."
