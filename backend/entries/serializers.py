from rest_framework import serializers
from .models import Entry, EntryClass
from .enums import EntryType


from .exceptions import (
    DuplicateEntryException,
    EntryTypeMismatchException,
    EntryMustHaveASubtype,
    EntryTypeDoesNotExist,
)

from drf_spectacular.extensions import OpenApiSerializerExtension


class EntryListCompressedTreeSerializerExtension(OpenApiSerializerExtension):
    target_class = "entries.serializers.EntryListCompressedTreeSerializer"

    def map_serializer(self, auto_schema, direction):
        # Define the schema for the serializer
        entities_schema = {
            "type": "object",
            "additionalProperties": {
                "type": "array",
                "items": {
                    "oneOf": [
                        {"type": "string"},  # For single field case
                        {
                            "type": "object",
                            "additionalProperties": {"type": "string"},
                        },  # For multiple fields case
                    ]
                },
            },
        }

        artifacts_schema = {
            "type": "object",
            "additionalProperties": {
                "type": "array",
                "items": {
                    "oneOf": [
                        {"type": "string"},  # For single field case
                        {
                            "type": "object",
                            "additionalProperties": {"type": "string"},
                        },  # For multiple fields case
                    ]
                },
            },
        }

        # Combined schema
        return {
            "type": "object",
            "properties": {"entities": entities_schema, "artifacts": artifacts_schema},
            "required": ["entities", "artifacts"],
            "description": "A compressed tree representation of entries, organized by type (entities/artifacts) and subtype.",  # noqa: E501
        }

    def get_schema_operation_parameters(self, auto_schema, *args, **kwargs):
        return [
            {
                "name": "fields",
                "in": "query",
                "description": "Comma-separated list of fields to include in the serialized output",
                "schema": {"type": "string"},
                "example": "name,id,description",
            }
        ]


class EntryTypesCompressedTreeSerializerExtension(OpenApiSerializerExtension):
    target_class = "entries.serializers.EntryTypesCompressedTreeSerializer"

    def map_serializer(self, auto_schema, direction):
        # Define the schema for the serializer
        return {"type": "array", "items": {"type": "string"}}

    def get_schema_operation_parameters(self, auto_schema, *args, **kwargs):
        return [
            {
                "name": "fields",
                "in": "query",
                "description": "Comma-separated list of fields to include in the serialized output",
                "schema": {"type": "string"},
                "example": "name",
            }
        ]


class EntryListCompressedTreeSerializer(serializers.BaseSerializer):
    def __init__(self, *args, fields=("name",), **kwargs):
        self.fields = fields
        super().__init__(*args, **kwargs)

    def serialize_entry(self, entry):
        if len(self.fields) == 1:
            return getattr(entry, self.fields[0])

        return {field: getattr(entry, field) for field in self.fields}

    def add_to_tree(self, tree, entry):
        if entry.entry_class.type == EntryType.ENTITY:
            tree["entities"].setdefault(entry.entry_class.subtype, []).append(
                self.serialize_entry(entry)
            )
        else:
            tree["artifacts"].setdefault(entry.entry_class.subtype, []).append(
                self.serialize_entry(entry)
            )

    def to_representation(self, data):
        tree = {"entities": {}, "artifacts": {}}

        for entry in data.all():
            self.add_to_tree(tree, entry)

        return tree


class EntryTypesCompressedTreeSerializer(serializers.BaseSerializer):
    def __init__(self, *args, fields=("name",), **kwargs):
        self.fields = fields
        super().__init__(*args, **kwargs)

    def to_representation(self, data):
        unique_subtypes = data.values_list("entry_class__subtype", flat=True).distinct()

        return list(unique_subtypes)


class ArtifactClassSerializer(serializers.ModelSerializer):
    subtype = serializers.CharField(max_length=20)
    regex = serializers.CharField(max_length=65536, default="")
    options = serializers.CharField(max_length=65536, default="")

    class Meta:
        model = EntryClass
        fields = ["subtype", "regex", "options", "catalyst_type"]

    def validate(self, data):
        data["type"] = EntryType.ARTIFACT

        if "regex" not in data:
            data["regex"] = ""

        if "options" not in data:
            data["options"] = ""

        return super().validate(data)

    def create(self, validated_data):
        validated_data["type"] = EntryType.ARTIFACT
        return super().create(validated_data)


class EntryClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryClass
        fields = [
            "type",
            "subtype",
            "description",
            "generative_regex",
            "regex",
            "options",
            "prefix",
            "color",
            "catalyst_type",
        ]


class EntryResponseSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True)
    entry_class = EntryClassSerializer(read_only=True)

    class Meta:
        model = Entry
        fields = ["id", "name", "description", "entry_class"]

    def to_representation(self, instance):
        """Move fields from profile to user representation."""
        representation = super().to_representation(instance)
        entry_class_repr = representation.pop("entry_class")

        for key in entry_class_repr:
            representation[key] = entry_class_repr[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to profile to their own profile dictionary."""
        entry_class_internal = {}
        for key in EntryClassSerializer.Meta.fields:
            if key in data:
                entry_class_internal[key] = data.pop(key)

        internal = super().to_internal_value(data)
        internal["entry_class"] = entry_class_internal
        return internal


class EntitySerializerExtension(OpenApiSerializerExtension):
    target_class = "entries.serializers.EntitySerializer"
    match_subclasses = True

    def map_serializer(self, auto_schema, direction):
        schema = super().map_serializer(auto_schema, direction)
        schema["properties"]["subtype"] = {
            "type": "string",
            "description": "Subtype for the entry",
        }
        required = schema.get("required", [])
        if "subtype" not in required:
            required.append("subtype")
        schema["required"] = required
        return schema


class EntitySerializer(serializers.ModelSerializer):
    entry_class = EntryClassSerializer(read_only=True)

    class Meta:
        model = Entry
        fields = ["id", "name", "description", "entry_class", "is_public"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def exists(self) -> bool:
        if Entry.objects.filter(
            name=self.validated_data["name"],
            entry_class__subtype=self.validated_data["entry_class"].subtype,
        ).exists():
            return True
        return False

    def to_representation(self, instance):
        """Move fields from profile to user representation."""
        representation = super().to_representation(instance)
        entry_class_repr = representation.pop("entry_class")

        for key in entry_class_repr:
            if key in representation:
                continue
            representation[key] = entry_class_repr[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to profile to their own profile dictionary."""
        data["type"] = EntryType.ENTITY

        if "subtype" not in data or not data["subtype"]:
            raise EntryMustHaveASubtype()

        for i in data:  # For lists in querydict
            if isinstance(data[i], list):
                data[i] = data[i][0]

        internal = super().to_internal_value(data)
        entryclass = EntryClass.objects.filter(
            type=EntryType.ENTITY, subtype=data["subtype"]
        )

        if not entryclass.exists():
            raise EntryTypeDoesNotExist()

        internal["entry_class"] = entryclass.first()
        return internal

    def validate(self, data):
        """First checks whether there exists another entity with the
            same name, in which entity it returns error code 409. Otherwise,
        it applies the other validations from the superclass.

        Args:
            data: a dictionary containing the attributes of
                the Entry entry

        Returns:
            True iff the validations pass. Otherwise, it raises DuplicateEntityException
                which returns error code 409.
        """
        entry_class = EntryClass.objects.filter(subtype=data["entry_class"].subtype)

        if not entry_class.exists():
            raise EntryTypeDoesNotExist()

        if entry_class.first().type != EntryType.ENTITY:
            raise EntryTypeMismatchException()

        data["entry_class"] = entry_class.first()

        if not data.get("name"):
            raise serializers.ValidationError("Name is required.")

        return super().validate(data)

    def create(self, validated_data):
        """Creates a new Entry based on the validated data.
            Also sets the type attribute to "entity" before creating the entry.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entry

        Returns:
            The created Entry entry
        """
        return super().create(validated_data)


class ArtifactSerializer(serializers.ModelSerializer):
    type = serializers.ReadOnlyField(default="artifact")

    class Meta:
        model = Entry
        fields = ["name", "subtype"]

    def to_representation(self, instance):
        """Move fields from profile to user representation."""
        representation = super().to_representation(instance)
        entry_class_repr = representation.pop("entry_class")

        for key in entry_class_repr:
            if key in representation:
                continue
            representation[key] = entry_class_repr[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to profile to their own profile dictionary."""
        data["type"] = EntryType.ARTIFACT
        entry_class_internal = {}
        for key in EntryClassSerializer.Meta.fields:
            if key in data:
                entry_class_internal[key] = data.pop(key)

        internal = super().to_internal_value(data)
        internal["entry_class"] = EntryClass(**entry_class_internal)
        return internal

    def validate(self, data):
        """First checks whether there exists another entity with the
            same name, in which entity it returns error code 409. Otherwise,
        it applies the other validations from the superclass.

        Args:
            data: a dictionary containing the attributes of
                the Entry entry

        Returns:
            True iff the validations pass. Otherwise, it raises DuplicateEntityException
                which returns error code 409.
        """
        entry_class = EntryClass.objects.filter(subtype=data["entry_class"].subtype)

        if entry_class.exists() and entry_class.first().type != EntryType.ARTIFACT:
            raise EntryTypeMismatchException()

        entry_exists = Entry.objects.filter(
            entry_class=data["entry_class"], name=data["name"]
        ).exists()
        if entry_exists:
            raise DuplicateEntryException()

        return super().validate(data)

    def create(self, validated_data):
        """Creates a new Entry based on the validated data.
            Also sets the type attribute to "entity" before creating the entry.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entry

        Returns:
            The created Entry entry
        """
        entry_class_serializer = EntryClassSerializer(
            instance=validated_data["entry_class"]
        )
        EntryClass.objects.get_or_create(**entry_class_serializer.data)

        return super().create(validated_data)


class EntrySerializer(serializers.ModelSerializer):
    entry_class = EntryClassSerializer(read_only=True)

    class Meta:
        model = Entry
        fields = ["id", "name", "entry_class"]

    def to_representation(self, instance):
        """Move fields from profile to user representation."""
        representation = super().to_representation(instance)
        entry_class_repr = representation.pop("entry_class")
        for key in entry_class_repr:
            representation[key] = entry_class_repr[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to profile to their own profile dictionary."""
        entry_class_internal = {}
        for key in EntryClassSerializer.Meta.fields:
            if key in data:
                entry_class_internal[key] = data.pop(key)

        internal = super().to_internal_value(data)
        internal["entry_class"] = entry_class_internal
        return internal


class EntityAccessAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ["id", "name"]
