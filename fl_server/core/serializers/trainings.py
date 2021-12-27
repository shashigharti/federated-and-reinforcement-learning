from rest_framework import serializers
from core.models import TrainingCycle


class TrainingCycleSerializer(serializers.ModelSerializer):
    cycle = serializers.CharField(max_length=25)
    start_alpha = serializers.CharField(max_length=200, default="")
    start_beta = serializers.CharField(max_length=200, default="")
    end_alpha = serializers.CharField(max_length=200, default="")
    end_beta = serializers.CharField(max_length=200, default="")
    status = serializers.CharField(max_length=25, default="inactive")
    workers_participated = serializers.IntegerField(default=2)

    class Meta:
        model = TrainingCycle
        fields = "__all__"

    def create(self, validated_data):
        """
        Create and return a new `TrainingCycle` instance, given the validated data.
        """
        return TrainingCycle.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `TrainingCycle` instance, given the validated data.
        """
        instance.cycle = validated_data.get("cycle", instance.cycle)
        instance.start_alpha = validated_data.get("start_alpha", instance.start_alpha)
        instance.start_beta = validated_data.get("start_beta", instance.start_beta)
        instance.end_alpha = validated_data.get("end_alpha", instance.end_alpha)
        instance.end_beta = validated_data.get("end_beta", instance.end_beta)
        instance.status = validated_data.get("status", instance.status)
        instance.workers_participated = validated_data.get(
            "workers_participated", instance.workers_participated
        )

        instance.save()
        return instance
