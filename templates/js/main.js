const socket = io(); //socketio connection to server//
var ctx, cns;
var gfx = {};
var loadedassectcount = 0;
var assectcount = 3;
var y = 10;
var projectiles = [];
var players = {};
var lastshot = 0;
var myID = 0;


$(document).ready(function () {
    cns = $("#gameStage")[0];
    ctx = cns.getContext("2d");
    start();
    $(".btn").click(function () {
        socket.emit("move", function (msg) {
            console.log(msg);
        });
    });
    $(document).keydown(function (e) {
        let move = false;
        switch (e.keyCode) {
            case 38: // up
                y = y - 5;
                move = true;
                break;
            case 40: // down
                y = y + 5;
                move = true;
                break;
            case 32: // space
                if ((Date.now() - lastshot) > 1000) {
                    lastshot = Date.now();
                    let pr = { 'x': 50 + (myID * 170), 'y': y, 'p': myID };
                    projectiles.push(pr);
                    socket.emit("shoot", pr, function (msg) {
                        console.log(msg);
                    });
                    console.log("shoot");
                }
                break;
        }
        if (y < 0) y = 0;
        if (y > 615) y = 615;
        if (move) {
            let pr = { 'y': y, 'id': myID };
            socket.emit("move", pr, function (msg) { });
        }
    });
});

socket.on("connect", () => {
    console.log("connected");
    socket.emit("start", function (msg) { });
});

socket.on("disconnect", () => {
    console.log("disconnected");
});

socket.on("shoot", function (msg) {
    projectiles.push(msg);
});

socket.on("start", function (msg) {
    myID = msg.id;
    console.log("myID", myID, msg);
    for (i in msg.playerpos) {
        if (i != myID)
            players[i] = msg.playerpos[i];
    }
});

socket.on("newplayer", function (msg) {
    players[msg.id] = msg.y;
});

socket.on("move", function (msg) {
    console.log(msg);
    players[msg.id] = msg.y;
});

function loadGfx() {
    gfx['chicken'] = new Image();
    gfx['chicken'].src = "img/chicken.png";
    gfx['laserl'] = new Image();
    gfx['laserl'].src = "img/laserl.png";
    gfx['laserr'] = new Image();
    gfx['laserr'].src = "img/laserr.png";
    for (g in gfx) {
        gfx[g].onload = function () {
            loadedassectcount++;
            startAnim();
        };
    }
}

function draw(image, x, y) {
    ctx.drawImage(gfx[image], x, y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, cns.width, cns.height);
}

function start() {
    loadGfx();
}

function startAnim() {
    if (loadedassectcount >= assectcount) {
        console.log('startanim');
        setInterval(animCycle, 1000 / 24);
    }
}

function animCycle() {
    clearCanvas();
    draw('chicken', 10 + (myID * 170), y);
    for (i in players) {
        draw('chicken', 10 + (i * 170), players[i]);
    }
    todel = [];
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].x += 20;
        draw('laserr', projectiles[i].x, projectiles[i].y);
        if (projectiles[i].x > 1240) {
            todel.push(i);
        }
    }
    for (let i = todel.length - 1; i >= 0; i--) {
        projectiles.splice(todel[i], 1);
    }
}