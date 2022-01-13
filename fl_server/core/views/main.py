from django.http import HttpResponse
from django.core.serializers import serialize
from django.shortcuts import render
from core.models import ServerData
from core.serializers import GlobalTrainingCycleSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser


@api_view(["GET"])
def index(request):
    """
    Display the index page
    """
    serverdata_list = ServerData.objects.order_by("created_at")
    data_dict = {"access_records": serverdata_list}
    return render(request, "core/index.html", context=data_dict)


@api_view(["POST"])
def training_create(request):
    """
    create the training record for a model"""

    data = JSONParser().parse(request)
    serializer = GlobalTrainingCycleSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)
