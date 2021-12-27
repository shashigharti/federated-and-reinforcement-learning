from django.db import models
from .server_data import ServerData


class TrainingCycle(models.Model):
    server = models.ForeignKey(ServerData, on_delete=models.CASCADE)
    cycle = models.CharField(max_length=25)
    start_alpha = models.CharField(max_length=200, default="")
    start_beta = models.CharField(max_length=200, default="")
    end_alpha = models.CharField(max_length=200, default="")
    end_beta = models.CharField(max_length=200, default="")
    status = models.CharField(max_length=25, default="inactive")
    workers_participated = models.IntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
