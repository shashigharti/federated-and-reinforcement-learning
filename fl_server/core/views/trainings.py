from core.models import ServerData, GlobalTrainingCycle

from django.http import HttpResponse, JsonResponse
from django.core.serializers import serialize
from rest_framework.decorators import api_view


@api_view(["POST"])
def training_store(request):
    """
    create the training record for a model"""

    data = {"id": "post"}
    return JsonResponse(data)


@api_view(["PUT"])
def training_update(request, id):
    """
    update the training record for a model"""
    data = {"id": "put"}
    return JsonResponse(data)


@api_view(["GET"])
def training_all(request, group_name):
    """
    Get the training information of a given model using group_name"""

    model_grp = ServerData.objects.filter(group_name=group_name)
    model_grp_serialized = serialize("json", model_grp, fields=("__all__"))
    return HttpResponse(model_grp_serialized, content_type="application/json")
