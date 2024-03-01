from flask import Flask,render_template,request
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_url_path='', static_folder='templates')
socketio = SocketIO(app,debug=True,cors_allowed_origins='*', async_mode='eventlet')

playercount = 0
playerpos = {}

@app.route('/')
def main():
    return render_template('index.html')

@socketio.on("move")
def cmove(data):
    global playerpos
    sid = request.sid
    playerpos[data["id"]] = data["y"]
    emit('move', data, broadcast=True, include_self=False)
    socketio.sleep(1)

@socketio.on("zombiemove")
def zmove(data):
    emit('zombiemove', data, broadcast=True, include_self=False)
    socketio.sleep(1)

@socketio.on("shoot")
def cshoot(data):
    sid = request.sid
    emit('shoot', data, broadcast=True, include_self=False)
    socketio.sleep(1)

@socketio.on("scores")
def scores(data):
    sid = request.sid
    emit('scores', data, broadcast=True, include_self=False)
    socketio.sleep(1)

@socketio.on("start")
def cstart():
    global playercount
    global playerpos
    sid = request.sid
    playerpos[playercount] = 30
    emit('start', {"id": playercount,'playerpos': playerpos}, room=sid)
    emit('newplayer', {"id": playercount,'y':30}, broadcast=True, include_self=False)
    if playercount == 1:
            emit('startgame',playercount,broadcast=True, include_self=True)
    playercount = playercount + 1
    if playercount > 1:
        playercount = 0
    socketio.sleep(1)


