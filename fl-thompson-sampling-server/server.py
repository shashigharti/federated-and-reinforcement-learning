import websockets
import asyncio
import json


PORT = 1234
print("Started the server and its listening on port: " + str(PORT))

dim = 3
policy = [0.8, 0.1, 0.1]

# global weights
alphas = [1] * dim
betas = [1] * dim

# model queue
worker_models = []


async def echo(websocket, path):
    global alphas, betas, worker_models, dim, policy
    async for message in websocket:
        print("Received  message from client: " + message, type(message))

        received_messages = message.split(",", 1)
        response = {}
        if received_messages[0] == "update":
            print("[action]Updating Params")
            weights = json.loads(received_messages[1])
            w_alphas, w_betas = (
                list(weights["alphas"].values()),
                list(weights["betas"].values()),
            )

            worker_models.append([w_alphas, w_betas])
            print("No. of elements in weights queue:", len(worker_models))
            response = {"type": "update", "params": {"al": alphas, "bt": betas}}

            # Average weights if we have weights from more than 1 worker
            if len(worker_models) > 1:
                avg_alphas = [0] * dim
                avg_betas = [0] * dim
                print("Workers Weights(Gradients):", worker_models)
                for worker in worker_models:
                    avg_alphas = [x + y for (x, y) in zip(avg_alphas, worker[0])]
                    avg_betas = [x + y for (x, y) in zip(avg_betas, worker[1])]

                avg_alphas = [elem / len(worker_models) for elem in avg_alphas]
                avg_betas = [elem / len(worker_models) for elem in avg_betas]

                # update values
                alphas = [a + avg_a for (a, avg_a) in zip(alphas, avg_alphas)]
                betas = [b + avg_b for (b, avg_b) in zip(betas, avg_betas)]

                print("Updated", alphas, betas)

                # reset the weights queues
                worker_models = []
                response = {"type": "avg", "params": {"al": alphas, "bt": betas}}
        elif received_messages[0] == "connected":
            print("[action]Connected")
            response = {
                "type": "init-params",
                "params": {"al": alphas, "bt": betas, "dim": dim, "policy": policy},
            }
        # elif received_messages[0] == "get-params":
        #     print("[action]Get params")
        #     response = {
        #         "type": "params",
        #         "params": {"al": alphas, "bt": betas},
        #     }
        await websocket.send(json.dumps(response))


start_server = websockets.serve(echo, "localhost", PORT)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
