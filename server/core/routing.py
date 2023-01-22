from django.urls import path, re_path
from core.consumers import FlConsumer

websocket_urlpatterns = [
    path(r"fl-server/<str:model_name>", FlConsumer.as_asgi()),
]
