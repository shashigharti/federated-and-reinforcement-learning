from rest_framework import serializers
from core.models import TrainingCycleDetails


class TrainingCycleDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCycleDetails
        fields = "__all__"
