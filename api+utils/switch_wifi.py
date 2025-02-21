from djitellopy import Tello

tello = Tello()

tello.connect()
print(tello.get_battery())
# tello.takeoff()

ssid = "InnovLab"
password = "PASSWORD" # Put real password here
tello.connect_to_wifi(ssid, password)

# print(tello.TELLO_IP)
# print(tello.)
