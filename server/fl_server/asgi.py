"""
ASGI config for fl_server project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import core.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "websocket_app.settings")
# application = get_asgi_application()
application = ProtocolTypeRouter(
    {  # handle http requests
        "http": get_asgi_application(),
        # handle websocket requests
        "websocket": AuthMiddlewareStack(URLRouter(core.routing.websocket_urlpatterns)),
    }
)
