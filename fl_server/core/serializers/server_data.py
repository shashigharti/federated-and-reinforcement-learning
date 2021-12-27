from rest_framework import serializers
from core.models import ServerData


class ServerDataSerializer(serializers.ModelSerializer):
    # cycle = serializers.CharField(max_length=25)
    # start_alpha = serializers.CharField(max_length=200, default="")
    # start_beta = serializers.CharField(max_length=200, default="")
    # end_alpha = serializers.CharField(max_length=200, default="")
    # end_beta = serializers.CharField(max_length=200, default="")
    # status = serializers.CharField(max_length=25, default="inactive")
    # workers_participated = serializers.IntegerField(default=2)

    class Meta:
        model = ServerData
        fields = "__all__"
