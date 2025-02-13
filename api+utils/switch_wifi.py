from djitellopy import Tello

tello = Tello()

tello.connect()
print(tello.get_battery())
# tello.takeoff()

login = "InnovLab"
password = "PASSWORD" # Put real password here
tello.connect_to_wifi(login, password)

# print(tello.TELLO_IP)
# print(tello.)
