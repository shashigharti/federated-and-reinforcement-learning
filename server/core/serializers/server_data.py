from rest_framework import serializers
from core.models import ServerData


class ServerDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerData
        fields = "__all__"
