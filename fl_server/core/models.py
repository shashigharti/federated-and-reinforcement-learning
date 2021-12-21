from django.db import models


class ServerData(models.Model):
    alpha = models.CharField(max_length=200)
    beta = models.CharField(max_length=200)
    dim = models.IntegerField(default=0)
