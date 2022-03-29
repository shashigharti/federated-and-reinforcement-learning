from django.shortcuts import render
from core.models import ServerData, GlobalTrainingCycle, TrainingCycleDetails
from core.serializers import (
    GlobalTrainingCycleSerializer,
    ServerDataSerializer,
    TrainingCycleDetailsSerializer,
)
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET"])
def index(request):
    """
    Display the index page
    """
    serverdata_list = ServerData.objects.order_by("id")
    data_dict = {"access_records": serverdata_list}
    return render(request, "core/index.html", context=data_dict)


@api_view(
    [
        "GET",
    ]
)
def model_list(request):
    """
    Display the index page
    """
    serverdata_list = ServerDataSerializer(ServerData.objects.order_by("id"), many=True)
    # return JsonResponse(serverdata_list.data, safe=False, status=201)
    return Response(serverdata_list.data)


@api_view(
    [
        "PUT",
    ]
)
def model_update(request, model_id):
    """
    update model status"""

    server_data = ServerData.objects.filter(id=model_id).first()
    serializer = ServerDataSerializer(server_data, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)


@api_view(
    [
        "GET",
    ]
)
def training_cycle_list(request, model_id):
    """
    Display the index page
    """
    globaltrainingcycle_list = GlobalTrainingCycleSerializer(
        GlobalTrainingCycle.objects.filter(server_data_id=model_id).order_by(
            "-created_at"
        ),
        many=True,
    )
    return JsonResponse(globaltrainingcycle_list.data, safe=False, status=201)


@api_view(
    [
        "POST",
    ]
)
def training_cycle_create(request):
    """
    create the training record for a model"""

    serializer = GlobalTrainingCycleSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)


@api_view(
    [
        "PUT",
    ]
)
def training_cycle_update(request, training_cycle_id):
    """
    update the params for the training cycle"""

    server_data = GlobalTrainingCycle.objects.filter(id=training_cycle_id).first()
    serializer = GlobalTrainingCycleSerializer(server_data, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)


@api_view(
    [
        "DELETE",
    ]
)
def training_cycle_delete(request, training_cycle_id):
    """
    delete training cycle"""

    try:
        GlobalTrainingCycle.objects.get(id=training_cycle_id).delete()
        return JsonResponse(
            {"message": "Training cycle was deleted successfully!"},
            status=201,
        )
    except:
        return JsonResponse(
            {"message": "Error deleting the training cycle"}, status=400
        )


@api_view(
    [
        "GET",
    ]
)
def training_cycle_details_list(request, global_training_cycle_id):
    """
    Display the index page
    """
    trainingcycledetails_list = TrainingCycleDetailsSerializer(
        TrainingCycleDetails.objects.filter(
            global_training_cycle_id=global_training_cycle_id
        ).order_by("created_at"),
        many=True,
    )
    return JsonResponse(trainingcycledetails_list.data, safe=False, status=201)


@api_view(
    [
        "POST",
    ]
)
def training_cycle_details_create(request):
    """
    create the record for a training cycle"""
    serializer = TrainingCycleDetailsSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)

    return JsonResponse(serializer.errors, status=400)
