from rest_framework import serializers
from core.models import GlobalTrainingCycle


class TrainingCycleSerializer(serializers.ModelSerializer):
    server_id = models.ForeignKey(ServerData, on_delete=models.CASCADE)
    start_alphas = models.CharField(max_length=200, default="")
    start_betas = models.CharField(max_length=200, default="")
    end_alphas = models.CharField(max_length=200, default="")
    end_betas = models.CharField(max_length=200, default="")
    cycle_status = models.CharField(max_length=25, default="inactive")
    n_worker_participated = models.IntegerField(default=2)
    config = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def create(self, validated_data):
        return GlobalTrainingCycle.create(validated_data)

    def update(self, instance, validated_data):
        return GlobalTrainingCycle.create(validated_data)

    class Meta:
        model = GlobalTrainingCycle
        fields = "__all__"
