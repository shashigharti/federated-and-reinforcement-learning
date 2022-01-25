from django.contrib import admin
from core.models import ServerData, GlobalTrainingCycle, TrainingCycleDetails


# Register models here
admin.site.register(ServerData)
admin.site.register(GlobalTrainingCycle)
admin.site.register(TrainingCycleDetails)
