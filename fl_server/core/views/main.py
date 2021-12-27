from django.http import HttpResponse
from django.core.serializers import serialize
from django.shortcuts import render
from core.models import ServerData


def index(request):
    """
    Display the index page
    """
    serverdata_list = ServerData.objects.order_by("created_at")
    data_dict = {"access_records": serverdata_list}
    return render(request, "core/index.html", context=data_dict)
