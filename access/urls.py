from django.urls import path
from .views.access_view import AccessList, UpdateAccess

urlpatterns = [
    path(
        "<int:user_id>/<int:case_id>/",
        UpdateAccess.as_view(),
        name="update_access",
    ),
    path("<int:user_id>/", AccessList.as_view(), name="access_list"),
]
