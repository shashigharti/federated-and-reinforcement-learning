from django.urls import path
from core import views

urlpatterns = [
    path("", views.index, name="index-page"),
    path("api/trainings", views.main, name="main"),
]
