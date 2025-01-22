from fastapi import FastAPI, HTTPException
from typing import Dict, List
from djitellopy import TelloSwarm, Tello
import uvicorn
from pydantic import BaseModel

# cors
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


swarm = None  # Global variable to store the TelloSwarm instance


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


class DroneIPs(BaseModel):
    ips: list[str]


@app.post("/connect")
async def connect_to_drones(drone_ips: DroneIPs):
    # check each drone individually
    working = []
    for ip in drone_ips.ips:
        # tello = Tello()
        # try:
        #     tello.connect(ip)
        # except Exception as e:
        #     continue
        # print(f"Connected to {ip}")
        working.append(ip)
        # tello.end()
    print(f"Working drones {len(working)}/{len(drone_ips.ips)}")

    global swarm
    swarm = TelloSwarm.fromIps(working)
    swarm.connect()
    print(len(swarm.tellos))
    return {"status": "connected"}


@app.get("/disconnect")
async def disconnect():
    global swarm
    swarm.end()
    swarm = None
    return {"status": "disconnected"}


@app.get("/get_battery")
async def get_battery():
    if not swarm:
        raise HTTPException(
            status_code=400, detail="Swarm not connected. Call /connect first"
        )
    battery: dict[str, int] = {}
    for tello in swarm.tellos:
        drone_name = tello.address[0]
        battery[drone_name] = int(tello.get_battery())
        print(drone_name, battery[drone_name])
    print(battery, type(battery))
    return battery


@app.get("/takeoff")
async def takeoff():
    if not swarm:
        raise HTTPException(
            status_code=400, detail="Swarm not connected. Call /connect first"
        )
    swarm.takeoff()
    return {"status": "takeoff"}


@app.get("/land")
async def land():
    if not swarm:
        raise HTTPException(
            status_code=400, detail="Swarm not connected. Call /connect first"
        )
    swarm.land()
    return {"status": "land"}


class DroneCommand(BaseModel):
    command: str


@app.post("/command")
async def execute_command(command_data: DroneCommand):
    if not swarm:
        raise HTTPException(
            status_code=400, detail="Swarm not connected. Call /connect first"
        )

    try:
        command_name = command_data.command
        print(command_name)
        if command_name == "flip":
            swarm.parallel(lambda _, tello: tello.flip_forward())
        elif command_name == "forward":
            swarm.parallel(lambda _, tello: tello.move_forward(50))
        elif command_name == "back":
            swarm.parallel(lambda _, tello: tello.move_back(50))
        elif command_name == "left":
            swarm.parallel(lambda _, tello: tello.move_left(50))
        elif command_name == "right":
            swarm.parallel(lambda _, tello: tello.move_right(50))
        return {"status": "success", "command": command_data.command}
    except AttributeError:
        raise HTTPException(
            status_code=400, detail=f"Invalid command: {command_data.command}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to execute command: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
