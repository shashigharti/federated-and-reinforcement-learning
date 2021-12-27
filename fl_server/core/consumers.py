from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from core.models import ServerData, TrainingCycle
from asgiref.sync import sync_to_async


def _get_model(group_name):
    obj = ServerData.objects.filter(group_name=group_name).first()
    return obj


get_model = sync_to_async(_get_model, thread_sensitive=True)


class FlConsumer(AsyncJsonWebsocketConsumer):
    worker_models = {}
    weights = {}
    cycle = 0

    async def connect(self):
        self.room_name = "group_1"
        self.room_group_name = "group_1"

        print("[Socket]connected", self.room_name)
        print("[Socket] init params")
        model_obj = await get_model(self.room_group_name)
        alphas = [int(x) for x in getattr(model_obj, "alpha").split(",")]
        betas = [int(x) for x in getattr(model_obj, "beta").split(",")]
        dim = getattr(model_obj, "dim")
        max_worker = getattr(model_obj, "max_workers")

        if self.room_group_name not in self.weights:
            self.weights[self.room_group_name] = {
                "alphas": alphas,
                "betas": betas,
                "dim": dim,
                "max_worker": max_worker,
            }
            self.worker_models[self.room_group_name] = []

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Get the event and send the appropriate response
        """
        print("\n\n[Socket] Data received:{}".format(text_data))

        response_to_user = {}
        response_from_user = json.loads(text_data)
        event = response_from_user.get("event", None)

        if event == "connected":
            print("weights", self.weights)
            response_to_user = {
                "type": "send_message",
                "message": {
                    "type": "init-params",
                    "params": {
                        "al": self.weights[self.room_group_name]["alphas"],
                        "bt": self.weights[self.room_group_name]["betas"],
                        "dim": self.weights[self.room_group_name]["dim"],
                    },
                },
            }
        elif event == "update":
            print("[Socket] Updating Params")
            w_alphas = response_from_user.get("alphas", None)
            w_betas = response_from_user.get("betas", None)

            w_alphas, w_betas = (
                list(w_alphas.values()),
                list(w_betas.values()),
            )
            self.worker_models[self.room_group_name].append([w_alphas, w_betas])
            print(
                "No. of elements in weights queue:",
                len(self.worker_models[self.room_group_name]),
            )

            response_to_user = {
                "type": "send_message",
                "message": {
                    "type": "update",
                    "params": {
                        "al": self.weights[self.room_group_name]["alphas"],
                        "bt": self.weights[self.room_group_name]["betas"],
                    },
                },
            }

            # Average weights if we have weights from more than 1 worker
            if (
                len(self.worker_models[self.room_group_name])
                >= self.weights[self.room_group_name]["max_worker"]
            ):
                avg_alphas = [0] * self.weights[self.room_group_name]["dim"]
                avg_betas = [0] * self.weights[self.room_group_name]["dim"]

                print(
                    "[Socket] Workers Weights(Gradients):",
                    self.worker_models[self.room_group_name],
                )
                for worker in self.worker_models[self.room_group_name]:
                    avg_alphas = [x + y for (x, y) in zip(avg_alphas, worker[0])]
                    avg_betas = [x + y for (x, y) in zip(avg_betas, worker[1])]

                avg_alphas = [
                    elem / len(self.worker_models[self.room_group_name])
                    for elem in avg_alphas
                ]
                avg_betas = [
                    elem / len(self.worker_models[self.room_group_name])
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

                print("[Socket] Updated", self.weights)

                # reset the weights queues
                self.worker_models[self.room_group_name] = []
                response_to_user = {
                    "type": "send_message",
                    "message": {
                        "type": "avg",
                        "params": {
                            "al": self.weights[self.room_group_name]["alphas"],
                            "bt": self.weights[self.room_group_name]["betas"],
                            "cycle": self.cycle,
                        },
                    },
                }
                self.cycle += 1
                print("End cycle:{}", self.cycle)
                # response = {"type": "avg", "params": {"al": alphas, "bt": betas}}

        print("[Socket] Sending data:{}", response_to_user)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            response_to_user,
        )

    async def send_message(self, res):
        """Receive message from room group"""
        # Send message to WebSocket
        await self.send(text_data=json.dumps(res["message"]))
