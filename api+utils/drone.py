from djitellopy import TelloSwarm
import rich

swarm = TelloSwarm.fromIps(["192.168.10.21"])

swarm.connect()
# show batery for each
for tello in swarm.tellos:
    drone_name = tello.address
    battery = tello.get_battery()
    rich.print(f"{drone_name} battery: {battery}")


swarm.takeoff()
swarm.parallel(lambda _, tello: tello.flip_forward())
swarm.stop()

# swarm.parallel(lambda _, tello: tello.flip_back())
# swarm.parallel(lambda _, tello: tello.flip_forward())
# swarm.parallel(lambda _, tello: tello.flip_back())
# swarm.parallel(lambda _, tello: tello.flip_forward())
# swarm.parallel(lambda _, tello: tello.flip_back())



swarm.land()
swarm.end()
