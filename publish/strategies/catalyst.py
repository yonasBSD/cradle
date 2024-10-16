from typing import Dict, Iterable, List, Optional

from entries.models import Entry
from notes.models import Note
from user.models import CradleUser
from .base import BasePublishStrategy
from django.conf import settings
from ..platejs import markdown_to_pjs
import requests


class CatalystPublish(BasePublishStrategy):
    def __init__(self, tlp: str, category: str, subcategory: str) -> None:
        super().__init__()
        self.category = category
        self.subcategory = subcategory
        self.tlp = tlp

    def get_entity(
        self, catalyst_type: str, name: str, user: CradleUser
    ) -> Dict[str, Optional[str]]:
        if not catalyst_type:
            return None

        foo = catalyst_type.split("|")

        catalyst_type = foo[0]

        model_class = None
        if len(foo) > 1:
            model_class = foo[1]

        level = "STRATEGIC"
        if len(foo) > 2:
            level = foo[2]

        catalyst_types = catalyst_type.split("/")

        ctype = catalyst_types[0]
        csubtype = None
        if len(catalyst_types) > 1:
            csubtype = "/".join(catalyst_types[1:])

        url = f"{settings.CATALYST_HOST}/api/{ctype}/"

        if csubtype:
            params = {
                "type": csubtype,
                "value": name,
            }
        else:
            params = {
                "name": name,
            }

        response = requests.get(
            url,
            params=params,
            headers={"Authorization": "Token " + user.catalyst_api_key},
        )

        if response.status_code == 200:
            if response.json()["count"] > 0:
                data = response.json()["results"][0]

                res = {
                    "id": data["id"],
                    "type": model_class or ctype,
                    "level": level,
                }

                if csubtype:
                    res["value"] = (data["value"],)
                else:
                    res["value"] = (data["name"],)

                return res

        if response.status_code == 200 and csubtype:
            response = requests.post(
                url,
                json=params,
                headers={"Authorization": "Token " + user.catalyst_api_key},
            )

            if response.status_code == 201:
                data = response.json()
                res = {
                    "id": data["id"],
                    "type": model_class or ctype,
                    "value": data["value"],
                    "level": level,
                }

                return res

        return None

    def create_references(self, post_id: str, refs, user: CradleUser):
        references = []
        for entity in refs.values():
            references.append(
                {
                    "entity": entity["id"],
                    "entity_type": entity["type"],
                    "level": entity["level"],
                    "context": "",
                }
            )

        if not references:
            return

        response = requests.post(
            settings.CATALYST_HOST + "/api/posts/references/bulk/",
            headers={"Authorization": "Token " + user.catalyst_api_key},
            json={"post": post_id, "references": references},
        )

        # Handle response
        if response.status_code == 201:  # Check for successful creation
            return None
        else:
            return (
                f"Failed to create references: {response.status_code} {response.text}"
            )

    def publish(self, title: str, notes: List[Note], user: CradleUser):
        if not user.catalyst_api_key:
            return "User does not have a Catalyst API key"

        joint_md = "\n-----\n".join(map(lambda x: x.content, notes))

        entries: Iterable[Entry] = Note.objects.get_entries_from_notes(notes)
        entry_map = {}

        for i in entries:
            key = (i.entry_class.subtype, i.name)
            entry = self.get_entity(i.entry_class.catalyst_type, i.name, user)
            if entry:
                entry_map[key] = entry

        platejs = markdown_to_pjs(joint_md, entry_map)

        # Prepare the request body
        payload = {
            "title": title,
            "summary": "Published by cradle",
            "tlp": self.tlp,
            "category": "RESEARCH",
            "sub_category": "732c67b9-2a1b-44de-b99f-f7f580a5fbb7",
            "is_vip": False,
            "topics": [],
            "content": joint_md,
            "content_structure": platejs,
        }

        # Send the POST request
        response = requests.post(
            settings.CATALYST_HOST + "/api/posts/editor-contents/",
            headers={"Authorization": "Token " + user.catalyst_api_key},
            json=payload,
        )

        # Handle response
        if response.status_code == 201:  # Check for successful creation
            return self.create_references(response.json()["id"], entry_map, user)
        else:
            return f"Failed to create publication: {response.status_code} {response.json()}"
