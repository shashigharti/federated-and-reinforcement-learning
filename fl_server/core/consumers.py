from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json


class FlConsumer(AsyncJsonWebsocketConsumer):
    room_group_name = "notify"

    async def connect(self):
        self.room_name = "flserver"
        self.room_group_name = "flserver"
        print("connected", self.room_name)

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
        Get the event and send the appropriate event
        """
        response = json.loads(text_data)
        print(response)
        # event = response.get("event", None)
        # message = response.get("message", None)
        # if event == "update":
        #     # Send message to room group
        #     await self.channel_layer.group_send(
        #         self.room_group_name,
        #         {"type": "send_message", "message": message, "event": "MOVE"},
        #     )

    # async def send_message(self, res):
    #     """Receive message from room group"""
    #     # Send message to WebSocket
    #     await self.send(
    #         text_data=json.dumps(
    #             {
    #                 "payload": res,
    #             }
    #         )
    #     )
