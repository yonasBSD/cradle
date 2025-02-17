from typing import cast
from django_lifecycle.mixins import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, extend_schema_view

from user.models import CradleUser
from user.permissions import HasAdminRole, HasEntryManagerRole

from ..serializers import (
    EntryClassSerializer,
    ArtifactClassSerializer,
)
from ..models import EntryClass


@extend_schema_view(
    get=extend_schema(
        description="Allows an authenticated user to retrieve details of all EntryClasses.",
        responses={
            200: EntryClassSerializer(many=True),
            401: "User is not authenticated.",
            403: "User does not have permission.",
        },
        summary="Retrieve All Entry Classes",
    ),
    post=extend_schema(
        description="Allows an admin to create a new EntryClass"
        + "of type Artifact by specifying its subtype and format.",
        request=ArtifactClassSerializer,
        responses={
            200: ArtifactClassSerializer,
            400: "Bad request: Invalid data for creating an EntryClass.",
            401: "User is not authenticated.",
            403: "User is not an admin.",
            409: "EntryClass with the same name already exists.",
        },
        summary="Create New Entry Class",
    ),
)
class EntryClassList(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        entities = EntryClass.objects.all()
        serializer = EntryClassSerializer(entities, many=True)
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        user = cast(CradleUser, request.user)
        if not user.is_cradle_admin:
            return Response("User is not an admin.", status=status.HTTP_403_FORBIDDEN)

        serializer = EntryClassSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            serializer.instance.log_create(user)
            return Response(serializer.data)
        return Response("The data is not valid", status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        description="Retrieve details of a specific EntryClass by its subtype. Admin access required.",
        responses={
            200: EntryClassSerializer,
            401: "User is not authenticated.",
            403: "User is not an admin.",
            404: "EntryClass not found with specified subtype.",
        },
        summary="Retrieve Entry Class Details",
    ),
    delete=extend_schema(
        description="Delete an EntryClass by its subtype. Admin access required.",
        responses={
            200: "EntryClass deleted successfully.",
            401: "User is not authenticated.",
            403: "User is not an admin.",
            404: "EntryClass not found with specified subtype.",
        },
        summary="Delete Entry Class",
    ),
    post=extend_schema(
        description="Edit details of an EntryClass by its subtype. Admin access required.",
        request=ArtifactClassSerializer,
        responses={
            200: ArtifactClassSerializer,
            400: "Bad request: Invalid data for updating EntryClass.",
            401: "User is not authenticated.",
            403: "User is not an admin.",
            404: "EntryClass not found with specified subtype.",
            409: "EntryClass with the same name already exists.",
        },
        summary="Edit Entry Class",
    ),
)
class EntryClassDetail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, HasEntryManagerRole]

    def get(self, request: Request, class_subtype: str) -> Response:
        try:
            entity = EntryClass.objects.get(subtype=class_subtype)
        except EntryClass.DoesNotExist:
            return Response(
                "There is no entry class with specified subtype.",
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = EntryClassSerializer(entity)
        return Response(serializer.data)

    def delete(self, request: Request, class_subtype: str) -> Response:
        try:
            entity = EntryClass.objects.get(subtype=class_subtype)
        except EntryClass.DoesNotExist:
            return Response(
                "There is no entry class with specified subtype.",
                status=status.HTTP_404_NOT_FOUND,
            )
        entity.delete()
        return Response("Requested entry class was deleted", status=status.HTTP_200_OK)

    def post(self, request: Request, class_subtype: str) -> Response:
        user = cast(CradleUser, request.user)
        if not user.is_cradle_admin:
            return Response("User is not an admin.", status=status.HTTP_403_FORBIDDEN)

        try:
            entryclass = EntryClass.objects.get(subtype=class_subtype)
        except EntryClass.DoesNotExist:
            return Response(
                "There is no entry class with specified subtype.",
                status=status.HTTP_404_NOT_FOUND,
            )

        new_subtype = request.data.pop("subtype", None)
        request.data["subtype"] = class_subtype

        serializer = EntryClassSerializer(entryclass, data=request.data)

        if serializer.is_valid():
            serializer.save()

            with transaction.atomic():
                serializer.save()
                response = dict(serializer.data)

                if new_subtype != class_subtype and new_subtype:
                    entryclass = entryclass.rename(new_subtype)
                    response["subtype"] = new_subtype

                entryclass.log_edit(user)

            return Response(response)

        return Response(serializer.error_messages, status=status.HTTP_400_BAD_REQUEST)
