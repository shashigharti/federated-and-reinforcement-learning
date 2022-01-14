from django.db import models
from core.models import GlobalTrainingCycle
from jsonfield import JSONField


class TrainingCycleDetails(models.Model):
    global_training_cycle = models.ForeignKey(
        GlobalTrainingCycle, on_delete=models.CASCADE
    )
    params = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
