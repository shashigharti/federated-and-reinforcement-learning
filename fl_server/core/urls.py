from django.urls import path, include
from core import views

urlpatterns = [
    path("", views.index, name="index-page"),
    path("api/trainings", views.training_update, name="training-store"),
    path("api/trainings/<group_name>", views.training_all, name="training-all"),
    path("api/trainings/<id>", views.training_update, name="training-update"),
    path("api/trainings/<id>", views.training_update, name="training-get"),
]
