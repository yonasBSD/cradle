from rest_framework import serializers
from .models import Entity
from .exceptions import (
    DuplicateActorException,
    DuplicateCaseException,
    DuplicateEntryException,
)


class EntityResponseSerializer(serializers.ModelSerializer):

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Entity
        fields = ["id", "name", "description", "type", "subtype"]


class ActorSerializer(serializers.ModelSerializer):

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Entity
        fields = ["name", "description"]

    def validate(self, data):
        """First checks whether there exists another actor with the
            same name, in which case it returns error code 409. Otherwise,
        it applies the other validations from the superclass.

        Args:
            data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            True iff the validations pass. Otherwise, it raises DuplicateActorException
                which returns error code 409.
        """

        actor_exists = Entity.actors.filter(name=data["name"]).exists()
        if actor_exists:
            raise DuplicateActorException()
        return super().validate(data)

    def create(self, validated_data):
        """Creates a new Entity entity based on the validated data.
            Also sets the type attribute to "actor" before creating the entity.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            The created Entity entity
        """

        validated_data["type"] = "actor"
        return super().create(validated_data)


class CaseSerializer(serializers.ModelSerializer):

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Entity
        fields = ["name", "description"]

    def validate(self, data):
        """First checks whether there exists another case with the
            same name, in which case it returns error code 409. Otherwise,
        it applies the other validations from the superclass.

        Args:
            data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            True iff the validations pass. Otherwise, it raises DuplicateCaseException
                which returns error code 409.
        """

        case_exists = Entity.cases.filter(name=data["name"]).exists()
        if case_exists:
            raise DuplicateCaseException()
        return super().validate(data)

    def create(self, validated_data):
        """Creates a new Entity entity based on the validated data.
            Also sets the type attribute to "case" before creating the entity.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            The created Entity entity
        """

        validated_data["type"] = "case"
        return super().create(validated_data)


class CaseAccessAdminSerializer(serializers.ModelSerializer):

    class Meta:
        model = Entity
        fields = ["id", "name"]


class EntrySerializer(serializers.ModelSerializer):

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Entity
        fields = ["name", "description", "subtype"]

    def validate(self, data):
        """First checks whether there exists another entry with the
            same name and subtype, in which case it returns error code 409. Otherwise,
        it applies the other validations from the superclass.

        Args:
            data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            True iff the validations pass. Otherwise, it raises DuplicateEntryException
                which returns error code 409.
        """

        entry_exists = Entity.entries.filter(
            name=data["name"], subtype=data["subtype"]
        ).exists()
        if entry_exists:
            raise DuplicateEntryException()
        return super().validate(data)

    def create(self, validated_data):
        """Creates a new Entity entity based on the validated data.
            Also sets the type attribute to "entry" before creating the entity.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            The created Entity entity
        """

        validated_data["type"] = "entry"
        return super().create(validated_data)


class MetadataSerializer(serializers.ModelSerializer):

    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Entity
        fields = ["name", "description", "subtype"]

    def create(self, validated_data):
        """Creates a new Entity entity based on the validated data.
            Also sets the type attribute to "metadata" before creating the entity.

        Args:
            validated_data: a dictionary containing the attributes of
                the Entity entity

        Returns:
            The created Entity entity
        """
        validated_data["type"] = "metadata"
        return super().create(validated_data)


class EntitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Entity
        fields = ["id", "name", "type", "subtype"]
