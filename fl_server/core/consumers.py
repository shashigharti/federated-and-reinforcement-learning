from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from core.models import ServerData, GlobalTrainingCycle
from asgiref.sync import sync_to_async
import requests
import matplotlib.pyplot as plt
import numpy as np
import scipy.stats as ss


@sync_to_async(thread_sensitive=True)
def get_model_detail(model_name):
    obj = ServerData.objects.filter(model_name=model_name).first()
    return obj


@sync_to_async(thread_sensitive=True)
def get_cycle_detail(model_name):
    training_details = (
        GlobalTrainingCycle.objects.all()
        .filter(model_name=model_name)
        .order_by("-updated_at")
    )
    return training_details


@sync_to_async(thread_sensitive=True)
def create_training(pdata):
    r = requests.post("http://127.0.0.1:8000/api/trainings/create", json=pdata)
    print(r.json())


class FlConsumer(AsyncJsonWebsocketConsumer):
    weights = {}
    cycle = 0
    clients = {}
    mode = "registration"  # registration|training|avg
    isCycleEnd = False

    async def connect(self):
        self.room_name = "room_1"
        self.room_group_name = "room_1"

        print("\n\n[Socket] NEW CONNECTIONS", self.room_name)
        print("[Socket] init params")

        model_obj = await get_model_detail(self.room_group_name)
        alphas = [int(x) for x in getattr(model_obj, "alphas").split(",")]
        betas = [int(x) for x in getattr(model_obj, "betas").split(",")]
        dim = getattr(model_obj, "options")
        max_workers = getattr(model_obj, "max_workers")

        if self.room_group_name not in self.weights:
            self.weights[self.room_group_name] = {
                "alphas": alphas,
                "betas": betas,
                "dim": dim,
                "max_workers": max_workers,
            }
            self.clients[self.room_group_name] = {"ids": [], "weights": {}}

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
        if event == "connected":
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
                                    "cycle": self.cycle,
                                },
                            },
                        }
                        print(
                            "\n\n\n[Socket] ============== Training Mode Started ================== "
                        )
                        serverdata = await get_model_detail(self.room_group_name)
                        pdata = {
                            "server_data": getattr(serverdata, "id"),
                            "start_alphas": getattr(serverdata, "alphas"),
                            "start_betas": getattr(serverdata, "betas"),
                            "end_alphas": "0,0,0",
                            "end_betas": "0,0,0",
                            "cycle_status": "training",
                            "n_worker_participated": getattr(serverdata, "max_workers"),
                            "config": "{}",
                        }

                        # Create training data
                        data = await create_training(pdata)
                        print("after create training")
                    else:
                        print(
                            "[Socket] Waiting for {} more client/s".format(
                                self.weights[self.room_group_name]["max_workers"]
                                - len(self.clients[self.room_group_name]["ids"])
                            )
                        )

        elif event == "update":
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

                print("\n[Socket] **** Averaging Weights ****".format(self.cycle))
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

                response_to_user = {
                    "type": "send_message",
                    "message": {
                        "type": "new_weights",
                        "params": {
                            "al": self.weights[self.room_group_name]["alphas"],
                            "bt": self.weights[self.room_group_name]["betas"],
                            "cycle": self.cycle,
                        },
                    },
                }

            else:
                self.isCycleEnd = False

        if response_to_user != "":
            print("[Socket] Sending data:{}".format(response_to_user))

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                response_to_user,
            )
            if self.isCycleEnd:
                print("Cycle {} - End of cycle".format(self.cycle))
                self.cycle = self.cycle + 1
            print(
                "\n\n[Socket] ************** Cycle: {}  **************".format(
                    self.cycle
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
