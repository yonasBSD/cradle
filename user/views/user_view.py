from typing import cast
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, extend_schema_view
from ..serializers import UserCreateSerializer, UserRetrieveSerializer
from ..models import CradleUser


@extend_schema_view(
    get=extend_schema(
        description="Allows an admin to view a list of all users.",
        responses={
            200: UserRetrieveSerializer(many=True),
            401: "User is not authenticated.",
            403: "User is not an admin.",
        },
        summary="List All Users",
    ),
    post=extend_schema(
        description="Allows a user to create a new account with a unique username and password.",
        request=UserCreateSerializer,
        responses={
            200: "User created successfully.",
            400: "Invalid data or missing fields.",
            409: "User already exists.",
        },
        summary="Create New User",
    ),
)
class UserList(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = []
        return super().get_permissions()

    def get(self, request):
        users = CradleUser.objects.all()
        serializer = UserRetrieveSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            if not CradleUser.objects.filter(
                email=serializer.validated_data["email"]
            ).exists():
                serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        description="Retrieve details for a specific user by ID, or the current user if 'me' is specified.",
        responses={
            200: UserRetrieveSerializer,
            401: "User is not authenticated.",
            403: "Access denied.",
            404: "User not found.",
        },
        summary="Retrieve User Details",
    ),
    post=extend_schema(
        description="Edit a user's details, either their own or another user's if allowed.",
        request=UserCreateSerializer,
        responses={
            200: UserRetrieveSerializer,
            401: "User is not authenticated.",
            403: "Unauthorized edit attempt.",
            404: "User not found.",
        },
        summary="Edit User Details",
    ),
    delete=extend_schema(
        description="Delete a user account by ID. Admins can delete other users' accounts.",
        responses={
            200: "User account deleted successfully.",
            401: "User is not authenticated.",
            403: "Access denied.",
            404: "User not found.",
        },
        summary="Delete User Account",
    ),
)
class UserDetail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        initiator = cast(CradleUser, request.user)
        user = None
        if user_id == "me":
            user = initiator
        else:
            try:
                user = CradleUser.objects.get(id=user_id)
            except CradleUser.DoesNotExist:
                return Response(
                    "There is no user with the specified ID.",
                    status=status.HTTP_404_NOT_FOUND,
                )

        if not (
            initiator.pk == user.pk
            or (initiator.is_superuser and not user.is_superuser)
        ):
            return Response(
                "You are not allowed to view this user.",
                status=status.HTTP_403_FORBIDDEN,
            )

        json_user = UserRetrieveSerializer(user, many=False).data
        return Response(json_user, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        editor = cast(CradleUser, request.user)
        edited = None

        if user_id == "me":
            edited = editor
        else:
            try:
                edited = CradleUser.objects.get(id=user_id)
            except CradleUser.DoesNotExist:
                return Response(
                    "There is no user with the specified ID.",
                    status=status.HTTP_404_NOT_FOUND,
                )

        if not (
            editor.pk == edited.pk or (editor.is_superuser and not edited.is_superuser)
        ):
            return Response(
                "You are not allowed to edit this user.",
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserCreateSerializer(edited, data=request.data, partial=True)

        if serializer.is_valid():
            user = serializer.save()
            json_user = UserRetrieveSerializer(user, many=False).data
            return Response(json_user, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        deleter = cast(CradleUser, request.user)
        removed_user = None
        if user_id == "me":
            removed_user = deleter
        else:
            try:
                removed_user = CradleUser.objects.get(id=user_id)
            except CradleUser.DoesNotExist:
                return Response(
                    "There is no user with the specified ID.",
                    status=status.HTTP_404_NOT_FOUND,
                )

        if not (
            deleter.pk == removed_user.pk
            or (deleter.is_superuser and not removed_user.is_superuser)
        ):
            return Response(
                "You are not allowed to delete this user.",
                status=status.HTTP_403_FORBIDDEN,
            )

        removed_user.delete()
        return Response(
            "Requested user account was deleted.", status=status.HTTP_200_OK
        )


@extend_schema_view(
    get=extend_schema(
        description="Allows an admin to simulate a login for a non-admin user by obtaining a token pair.",
        responses={
            200: "Token pair for user",
            401: "User is not authenticated.",
            403: "Admin privilege required, cannot simulate admin login.",
            404: "User not found.",
        },
        summary="Simulate User Login",
    )
)
class UserSimulate(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_tokens_for_user(self, user: CradleUser):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    def get(self, request, user_id, *args, **kwargs):
        user = None
        try:
            user = CradleUser.objects.get(id=user_id)
        except CradleUser.DoesNotExist:
            return Response(
                "There is no user with the specified ID.",
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_superuser:
            return Response(
                "You are not allowed to simulate an admin.",
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(self.get_tokens_for_user(user), status=status.HTTP_200_OK)
