import websockets
import asyncio
import json


PORT = 1234
print("Started the server and its listening on port: " + str(PORT))
alphas = [1] * 24
betas = [1] * 24


def bandit_thompson(reward, sample_vector, alphas, betas):
    prev_alpha = alphas
    prev_beta = betas
    print(type(prev_alpha), type(reward), reward)

    # alphas = prev_alpha.add(reward)
    # betas = prev_beta.add(sample_vector.sub(reward))
    alphas = [a + reward[0] for a in prev_alpha]
    sv = [s - reward[0] for s in sample_vector]
    betas = [s + b for s, b in zip(sv, prev_beta)]

    return (alphas, betas)


async def echo(websocket, path):
    global alphas, betas

    print("A client just connected")
    async for message in websocket:
        print("Received  message from client: " + message, type(message))
        received_messages = message.split(",", 1)
        print("action", received_messages[0])
        response = {}
        if received_messages[0] == "run_plan":
            j_message = json.loads(received_messages[1])
            print("json:", j_message)
            reward, sample_vector, alphas, betas = (
                j_message["rV"],
                j_message["sV"],
                j_message["al"],
                j_message["bt"],
            )
            alphas, betas = bandit_thompson(reward, sample_vector, alphas, betas)
            print("updated alphas:{} betas:{}".format(alphas, betas))
            response = {"type": "updated_params", "params": {"al": alphas, "bt": betas}}
        elif received_messages[0] == "connection":
            response = {"type": "params", "params": {"al": alphas, "bt": betas}}
        await websocket.send(json.dumps(response))


start_server = websockets.serve(echo, "localhost", PORT)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
