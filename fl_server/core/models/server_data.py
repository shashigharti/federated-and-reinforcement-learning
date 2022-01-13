from django.db import models


class ServerData(models.Model):
    model_name = models.CharField(max_length=25, unique=True)
    alphas = models.CharField(max_length=200, default="")
    betas = models.CharField(max_length=200, default="")
    options = models.IntegerField(default=0)
    max_workers = models.IntegerField(default=2)
    status = models.CharField(max_length=25, default="inactive")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
