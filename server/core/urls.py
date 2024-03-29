from django.urls import path
from core import views

urlpatterns = [
    path("", views.index, name="index-page"),
    path("api/models", views.main.model_list, name="model-list"),
    path(
        "api/models/update/<int:model_id>/",
        views.main.model_update,
        name="update-model",
    ),
    path(
        "api/trainings/<int:model_id>/",
        views.main.training_cycle_list,
        name="training-list",
    ),
    path(
        "api/trainings/create",
        views.main.training_cycle_create,
        name="create-training-data",
    ),
    path(
        "api/trainings/update/<int:training_cycle_id>/",
        views.main.training_cycle_update,
        name="update-training-data",
    ),
    path(
        "api/trainings/<int:training_cycle_id>/delete",
        views.main.training_cycle_delete,
        name="delete-training-data",
    ),
    path(
        "api/trainings/cycle_details/create",
        views.main.training_cycle_details_create,
        name="create-training-cycle-detail",
    ),
    path(
        "api/trainings/<int:global_training_cycle_id>/cycle_details/",
        views.main.training_cycle_details_list,
        name="training-cycle-details-list",
    ),
]
