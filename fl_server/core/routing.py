from django.urls import path
from core.consumers import FlConsumer

websocket_urlpatterns = [
    path("fl-server", FlConsumer.as_asgi()),
]
