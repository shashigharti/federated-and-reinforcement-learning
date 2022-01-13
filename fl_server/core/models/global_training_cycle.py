from django.db import models
from .server_data import ServerData
from jsonfield import JSONField


class GlobalTrainingCycle(models.Model):
    server_data = models.ForeignKey(ServerData, on_delete=models.CASCADE)
    start_alphas = models.CharField(max_length=200, default="")
    start_betas = models.CharField(max_length=200, default="")
    end_alphas = models.CharField(max_length=200, default="")
    end_betas = models.CharField(max_length=200, default="")
    cycle_status = models.CharField(max_length=25, default="inactive")
    n_worker_participated = models.IntegerField(default=2)
    config = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
