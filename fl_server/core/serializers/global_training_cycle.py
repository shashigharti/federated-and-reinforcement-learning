from rest_framework import serializers
from core.models import GlobalTrainingCycle


class GlobalTrainingCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalTrainingCycle
        fields = "__all__"
