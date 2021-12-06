import websockets
import asyncio
import json


PORT = 1234
print("Started the server and its listening on port: " + str(PORT))

# global weights
alphas = [1] * 24
betas = [1] * 24
sample_vector = [1] * 24
reward_vector = [1] * 24

# model queue
worker_models = []


async def echo(websocket, path):
    global alphas, betas, worker_models, sample_vector, reward_vector

    print("A client just connected")
    async for message in websocket:
        print("Received  message from client: " + message, type(message))
        received_messages = message.split(",", 1)
        print("action", received_messages[0])
        response = {}
        if received_messages[0] == "update":
            weights = json.loads(received_messages[1])
            w_alphas, w_betas, w_reward_vector, w_sample_vector = (
                list(weights["alphas"].values()),
                list(weights["betas"].values()),
                list(weights["reward_vector"].values()),
                list(weights["sample_vector"].values()),
            )
            worker_models.append([w_alphas, w_betas, w_reward_vector, w_sample_vector])
            print("no of elements in weights queue:", len(worker_models))
            response = {"type": "update", "message": "successfully updated"}

            # Average weights if we have weights from more than 1 worker
            if len(worker_models) > 1:
                for worker in worker_models:
                    alphas = [x + y for (x, y) in zip(alphas, worker[0])]
                    betas = [x + y for (x, y) in zip(betas, worker[1])]
                    reward_vector = [x + y for (x, y) in zip(reward_vector, worker[2])]
                    sample_vector = [x + y for (x, y) in zip(sample_vector, worker[3])]

                alphas = [elem / len(worker_models) for elem in alphas]
                betas = [elem / len(worker_models) for elem in betas]
                reward_vector = [elem / len(worker_models) for elem in reward_vector]
                sample_vector = [elem / len(worker_models) for elem in sample_vector]

                print("Updated", alphas, betas, reward_vector, sample_vector)

                # reset the weights queues
                worker_models = []
                response = {"type": "avg", "message": "successfully updated"}

            return response

        elif received_messages[0] == "connection":
            response = {"type": "params", "params": {"al": alphas, "bt": betas}}
        await websocket.send(json.dumps(response))


start_server = websockets.serve(echo, "localhost", PORT)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
