from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from core.models import ServerData, GlobalTrainingCycle
from asgiref.sync import sync_to_async
import requests
import matplotlib.pyplot as plt
import numpy as np
import scipy.stats as ss
from core.serializers import GlobalTrainingCycleSerializer, ServerDataSerializer
from django.conf import settings
from django.http import JsonResponse


print("endpoint => {}".format(settings.END_POINT))


@sync_to_async(thread_sensitive=True)
def get_model_detail(modelname):
    model_obj = ServerData.objects.filter(model_name=modelname).first()
    return model_obj


@sync_to_async(thread_sensitive=True)
def get_updated_model_detail(model_id):
    model_training = GlobalTrainingCycle.objects.filter(server_data_id=model_id).first()
    return model_training


@sync_to_async(thread_sensitive=True)
def update_model(model_id, mdata):
    print("[Socket]Update model status")
    response = requests.put(
        "{}/api/models/update/{}/".format(settings.END_POINT, model_id),
        json=mdata,
    )
    print(response.json())
    return response.json()


@sync_to_async(thread_sensitive=True)
def get_training_detail(training_cycle_id):
    training_details = (
        GlobalTrainingCycle.objects.all().filter(pk=training_cycle_id).first()
    )
    return training_details


@sync_to_async(thread_sensitive=True)
def create_training(pdata):
    response = requests.post(
        "{}/api/trainings/create".format(settings.END_POINT), json=pdata
    )
    print(response.json())
    return response.json()


@sync_to_async(thread_sensitive=True)
def update_training(training_cycle_id, pdata):
    response = requests.put(
        "{}/api/trainings/update/{}/".format(settings.END_POINT, training_cycle_id),
        json=pdata,
    )
    print(response.json())
    return response.json()


@sync_to_async(thread_sensitive=True)
def create_training_cycle_details(pdata):
    response = requests.post(
        "{}/api/trainings/cycle_details/create".format(settings.END_POINT), json=pdata
    )
    print(response.json())
    return response.json()


class FlConsumer(AsyncJsonWebsocketConsumer):
    weights = {}
    clients = {}
    mode = "registration"  # registration|training|avg
    isCycleEnd = False
    rounds = 0  # total number of rounds
    current_model = ""
    global_training_cycle_id = 0

    def reset(self):
        self.weights = {}
        self.clients = {}
        self.mode = "registration"  # registration|training|avg
        self.isCycleEnd = False
        self.rounds = 0  # total number of rounds
        self.current_model = ""
        self.global_training_cycle_id = 0

    async def init(self):
        self.room_name = str(self.scope["url_route"]["kwargs"]["model_name"])
        self.room_group_name = str(self.scope["url_route"]["kwargs"]["model_name"])

        print("\n\n[Socket] New Connections", self.room_name)
        print("[Socket] init params")

        model_obj = await get_model_detail(self.room_group_name)
        model_weights = await get_updated_model_detail(getattr(model_obj, "id"))
        if model_weights == None:
            alphas = [float(x) for x in getattr(model_obj, "alphas").split(",")]
            betas = [float(x) for x in getattr(model_obj, "betas").split(",")]
        else:
            alphas = [float(x) for x in getattr(model_weights, "end_alphas").split(",")]
            betas = [float(x) for x in getattr(model_weights, "end_betas").split(",")]

        dim = getattr(model_obj, "options")
        max_workers = getattr(model_obj, "max_workers")

        if self.room_group_name not in self.weights:
            self.weights[self.room_group_name] = {
                "alphas": alphas,
                "betas": betas,
                "dim": dim,
                "max_workers": max_workers,
            }
            self.clients[self.room_group_name] = {"ids": [], "weights": {}, "cycle": 0}

        print(
            "[Socket] Model Details:{}".format(
                {
                    "alphas": alphas,
                    "betas": betas,
                    "dim": dim,
                    "max_workers": max_workers,
                }
            )
        )

    async def connect(self):
        await self.init()
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Get the event and send the appropriate response
        """
        response_to_user = ""
        response_from_user = json.loads(text_data)
        event = response_from_user.get("event", None)
        client_id = response_from_user.get("client_id", None)

        print("[Socket] Data received:{}".format(text_data))
        print("[Socket] Mode:{}".format(self.mode))
        print("[Socket] Event:{}".format(event))
        print("[Socket] client_id:{}".format(client_id))
        if event == "connected":
            self.room_name = response_from_user.get("model_name", None)
            if self.mode == "training":
                print("[Socket] Training Mode, No more registration")

            elif self.mode == "registration":
                if (
                    len(self.clients[self.room_group_name]["ids"])
                    < self.weights[self.room_group_name]["max_workers"]
                ):
                    # Register the connected clients
                    print("[Socket] Registration Mode ")
                    if client_id not in self.clients[self.room_group_name]["ids"]:
                        self.clients[self.room_group_name]["ids"].append(client_id)

                    print(
                        "[Socket] No. of Clients Registered:{} Clients:{}".format(
                            len(self.clients[self.room_group_name]["ids"]),
                            self.clients[self.room_group_name]["ids"],
                        )
                    )

                    if (
                        len(self.clients[self.room_group_name]["ids"])
                        == self.weights[self.room_group_name]["max_workers"]
                    ):
                        self.mode = "training"
                        response_to_user = {
                            "type": "send_message",
                            "message": {
                                "type": "init-params",
                                "params": {
                                    "al": self.weights[self.room_group_name]["alphas"],
                                    "bt": self.weights[self.room_group_name]["betas"],
                                    "dim": self.weights[self.room_group_name]["dim"],
                                    "max_workers": self.weights[self.room_group_name][
                                        "max_workers"
                                    ],
                                },
                            },
                        }
                        print(
                            "\n\n\n[Socket] ============== Training Mode Started ================== "
                        )

                        serverdata = await get_model_detail(self.room_group_name)
                        model_weights = await get_updated_model_detail(
                            getattr(serverdata, "id")
                        )
                        if model_weights == None:
                            pdata = {
                                "server_data": getattr(serverdata, "id"),
                                "start_alphas": getattr(serverdata, "alphas"),
                                "start_betas": getattr(serverdata, "betas"),
                                "end_alphas": getattr(serverdata, "alphas"),
                                "end_betas": getattr(serverdata, "alphas"),
                                "cycle_status": "training",
                                "n_worker_participated": getattr(
                                    serverdata, "max_workers"
                                ),
                                "config": "{}",
                            }
                        else:
                            pdata = {
                                "server_data": getattr(serverdata, "id"),
                                "start_alphas": getattr(model_weights, "start_alphas"),
                                "start_betas": getattr(model_weights, "start_betas"),
                                "end_alphas": getattr(model_weights, "end_alphas"),
                                "end_betas": getattr(model_weights, "end_alphas"),
                                "cycle_status": "training",
                                "n_worker_participated": getattr(
                                    serverdata, "max_workers"
                                ),
                                "config": "{}",
                            }

                        # Create training data
                        data = await create_training(pdata)
                        self.global_training_cycle_id = data["id"]
                        print("[Socket]Training registered")

                        # Update server status
                        sdata = await get_model_detail(self.room_name)
                        server_data_serializer = ServerDataSerializer(sdata)
                        sdata = server_data_serializer.data
                        print("[Socket]sdata:room_name =", sdata, self.room_name)
                        sdata["status"] = "training"
                        await update_model(sdata["id"], sdata)
                        print("[Socket]Update model")

                    else:
                        print(
                            "[Socket] Waiting for {} more client/s".format(
                                self.weights[self.room_group_name]["max_workers"]
                                - len(self.clients[self.room_group_name]["ids"])
                            )
                        )

        elif event == "update":
            print(
                "[Socket] Cycle => {}".format(
                    self.clients[self.room_group_name]["cycle"]
                )
            )
            print("[Socket] Data received: {}".format(text_data))
            print("[Socket] Got weights from client: {}".format(client_id))

            w_alphas = response_from_user.get("alphas", None)
            w_betas = response_from_user.get("betas", None)

            w_alphas, w_betas = (
                list(w_alphas.values()),
                list(w_betas.values()),
            )

            # update client weights
            self.clients[self.room_group_name]["weights"][client_id] = [
                w_alphas,
                w_betas,
            ]

            print(
                "[Socket] No. of weights received:",
                len(self.clients[self.room_group_name]["weights"]),
            )

            # Check if we received weights from all clients that were registered
            if (
                len(self.clients[self.room_group_name]["weights"])
                >= self.weights[self.room_group_name]["max_workers"]
            ):
                self.mode == "avg"

                print(
                    "\n[Socket] **** Averaging Weights ****".format(
                        self.clients[self.room_group_name]["cycle"]
                    )
                )
                print(
                    "[Socket] Workers Weights(Gradients):",
                    self.clients[self.room_group_name]["weights"],
                )

                # Average weights
                avg_alphas = [0] * self.weights[self.room_group_name]["dim"]
                avg_betas = [0] * self.weights[self.room_group_name]["dim"]

                for worker in self.clients[self.room_group_name]["weights"].values():
                    avg_alphas = [x + y for (x, y) in zip(avg_alphas, worker[0])]
                    avg_betas = [x + y for (x, y) in zip(avg_betas, worker[1])]

                avg_alphas = [
                    elem / len(self.clients[self.room_group_name]["weights"])
                    for elem in avg_alphas
                ]
                avg_betas = [
                    elem / len(self.clients[self.room_group_name]["weights"])
                    for elem in avg_betas
                ]

                # update values
                self.weights[self.room_group_name]["alphas"] = [
                    a + avg_a
                    for (a, avg_a) in zip(
                        self.weights[self.room_group_name]["alphas"], avg_alphas
                    )
                ]
                self.weights[self.room_group_name]["betas"] = [
                    b + avg_b
                    for (b, avg_b) in zip(
                        self.weights[self.room_group_name]["betas"], avg_betas
                    )
                ]
                print("[Socket] Updated New Weights", self.weights)

                # Reset the queues
                self.clients[self.room_group_name]["weights"] = {}
                self.clients[self.room_group_name]["ids"] = []
                self.isCycleEnd = True

                # Update global training cycle
                pdata = await get_training_detail(self.global_training_cycle_id)
                if pdata != None:
                    globaltrainingcycle = GlobalTrainingCycleSerializer(pdata)
                    pdata = globaltrainingcycle.data
                    pdata["end_alphas"] = ",".join(
                        [str(al) for al in self.weights[self.room_group_name]["alphas"]]
                    )
                    pdata["end_betas"] = ",".join(
                        [str(al) for al in self.weights[self.room_group_name]["betas"]]
                    )
                    pdata["cycle_status"] = "training"
                    pdata["rounds"] = self.clients[self.room_group_name][
                        "cycle"
                    ]  # self.cycle

                    # Update training data
                    await update_training(self.global_training_cycle_id, pdata)

                    # Update training detail data
                    await create_training_cycle_details(
                        {
                            "global_training_cycle": pdata["id"],
                            "params": json.dumps(
                                {
                                    "alphas": pdata["end_alphas"],
                                    "betas": pdata["end_betas"],
                                }
                            ),
                        }
                    )

                response_to_user = {
                    "type": "send_message",
                    "message": {
                        "type": "new_weights",
                        "params": {
                            "al": self.weights[self.room_group_name]["alphas"],
                            "bt": self.weights[self.room_group_name]["betas"],
                            "cycle": self.clients[self.room_group_name][
                                "cycle"
                            ],  # self.cycle,
                        },
                    },
                }

            else:
                self.isCycleEnd = False
        elif event == "end-of-training":
            print("[Socket] Reset, Update Status")
            # Update training data
            pdata = await get_training_detail(self.global_training_cycle_id)
            globaltrainingcycle = GlobalTrainingCycleSerializer(pdata)
            pdata = globaltrainingcycle.data
            pdata["cycle_status"] = "inactive"
            print("[Socket] pdata", pdata)
            await update_training(self.global_training_cycle_id, pdata)

            # Update server status
            sdata = await get_model_detail(self.room_name)
            server_data_serializer = ServerDataSerializer(sdata)
            sdata = server_data_serializer.data
            sdata["status"] = "inactive"
            await update_model(sdata["id"], sdata)
            print("[Socket]Update model")
            self.reset()

        if response_to_user != "":
            print("[Socket] Sending data:{}".format(response_to_user))

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                response_to_user,
            )
            if self.isCycleEnd:
                print(
                    "[Socket]Cycle {} - End of cycle".format(
                        self.clients[self.room_group_name]["cycle"]
                    )
                )
                self.clients[self.room_group_name]["cycle"] += 1
            print(
                "\n\n[Socket] ************** Cycle: {}  **************".format(
                    self.clients[self.room_group_name]["cycle"]
                )
            )

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_message(self, res):
        """Receive message from room group"""
        # Send message to WebSocket
        await self.send(text_data=json.dumps(res["message"]))
