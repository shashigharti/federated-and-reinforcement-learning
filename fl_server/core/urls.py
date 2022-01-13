from django.urls import path
from core import views

urlpatterns = [
    path("", views.index, name="index-page"),
    path("api/models", views.main.model_list, name="model-list"),
    path(
        "api/trainings/<int:model_id>/", views.main.training_list, name="training-list"
    ),
    path(
        "api/trainings/create", views.main.training_create, name="create-training-data"
    ),
    path(
        "api/trainings/update/<int:training_cycle_id>/",
        views.main.training_update,
        name="update-training-data",
    ),
]
