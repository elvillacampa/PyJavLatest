import socketio
import eventlet
import json
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)
import random

client_count = 0

def framer(lane):

    f = open("public/"+lane+".txt", "r") #Sample Data from the Vehicle Detection Module

    Lines = f.readlines()
    count = 0
    for line in Lines:
        count += 1
        sio.sleep(.05)
        sio.emit('frame'+lane, line)
        #print("Line{}: {}".format(count, line.strip()))

@sio.event
def initiator(sid, data):
    sio.start_background_task(framer(data)) #take note, this is a bg task



def task(sid):
    sio.sleep(10)
    res = sio.call('mult', {'numbers': [3, 4]}, to=sid)
    print(res)

@sio.event
def connect(sid, environ):
    print(sid, 'connected')
    global client_count
    client_count+=1
    # sio.start_background_task(framer)
    sio.emit('client_count', client_count)

@sio.event
def disconnect(sid):
    global client_count;
    client_count-=1
    print(sid, 'disconnected')
    sio.emit('client_count', client_count)

@sio.event
def sum(sid, data):
    result = data['numbers'][0] + data['numbers'][1]
    return {'result': result}
