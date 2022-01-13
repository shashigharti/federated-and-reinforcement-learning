from core.serializers.server_data import ServerDataSerializer
from rest_framework import serializers
from core.models import GlobalTrainingCycle, ServerData


class GlobalTrainingCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalTrainingCycle
        fields = "__all__"
