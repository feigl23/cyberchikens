const socket = io(); //socketio connection to server//
var ctx, cns;
var gfx = {};
var loadedassectcount = 0;
var assectcount = 3;
var y = 30;
var zy = 27;
var zx = 0;
var zombieDirection = 1;
var projectiles = [];
var players = {};
var lastshot = 0;
var myID = 0;
var x = 0;
var zombiePoint = 100;
var gamersPoint = 100;
var interval;

$(document).ready(function () {
    cns = $("#gameStage")[0];
    ctx = cns.getContext("2d");
    zx = cns.width - 138;
    start();
    updateScoreBoard();
    $(".btn").click(function () {
        socket.emit("move", function (msg) {
            console.log(msg);
        });
    });
    $(document).keydown(function (e) {
        let move = false;
        switch (e.keyCode) {
            case 38: // up
                y = y - 10;
                move = true;
                break;
            case 40: // down
                y = y + 10;
                move = true;
                break;
            case 32: // space
                if ((Date.now() - lastshot) > 1000) {
                    lastshot = Date.now();
                    let pr = { 'x': 70 + (myID * 170), 'y': y, 'p': myID, 'dir': 1 };
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
    x = 50 + (myID * 170)
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
socket.on("zombiemove", function (msg) {
    zy = msg.y;
});

socket.on("scores", function (msg) {
    zombiePoint = msg.zombiePoint;
    gamersPoint = msg.gamersPoint;
    updateScoreBoard();
});

function loadGfx() {
    gfx['chicken'] = new Image();
    gfx['chicken'].src = "img/chicken.png";
    gfx['laserl'] = new Image();
    gfx['laserl'].src = "img/laserl.png";
    gfx['laserr'] = new Image();
    gfx['laserr'].src = "img/laserr.png";
    gfx['zombie'] = new Image();
    gfx['zombie'].src = "img/zombie.png";
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
        interval = setInterval(animCycle, 1000 / 24);
    }
}

function animCycle() {
    clearCanvas();
    draw('chicken', x, y);
    Zombie();
    draw('zombie', zx, zy);
    for (i in players) {
        draw('chicken', 50 + (i * 170), players[i]);

    }
    todel = [];
    for (let i = 0; i < projectiles.length; i++) {

        projectiles[i].x += (20 * projectiles[i].dir);
        if (projectiles[i].dir == -1) {
            draw('laserl', projectiles[i].x, projectiles[i].y);
        } else {
            draw('laserr', projectiles[i].x, projectiles[i].y);
        }
        if (projectiles[i].x > 1240 || projectiles[i].x < 0) {
            todel.push(i);
        }
        if (projectiles[i].dir == -1) {

            if ((x + 55) >= projectiles[i].x && y <= projectiles[i].y && (y + 64) >= projectiles[i].y) {
                todel.push(i);
                gamersPoint -= 50;
                let pr = {};
                pr.gamersPoint = gamersPoint;
                pr.zombiePoint = zombiePoint;
                socket.emit("scores", pr, function (msg) {
                    updateScoreBoard();
                });
            }
            for (j in players) {
                if ((50 + (j * 170) + 55) >= projectiles[i].x && players[j] <= projectiles[i].y && (players[j] + 64) >= projectiles[i].y) {
                    todel.push(i);
                }

            }
        } else {
            if (zx <= projectiles[i].x && zy - 5 <= projectiles[i].y && (zy + 128) >= projectiles[i].y) {
                todel.push(i);
                zombiePoint -= 50;
                let pr = {};
                pr.gamersPoint = gamersPoint;
                pr.zombiePoint = zombiePoint;
                socket.emit("scores", pr, function (msg) {
                    updateScoreBoard();
                });
            }
        }
    }
    for (let i = todel.length - 1; i >= 0; i--) {
        projectiles.splice(todel[i], 1);
    }
}
function Zombie() {
    if (myID != 0) {
        return;
    }
    zy += 3 * zombieDirection;
    if (zy > cns.height - 138) {
        zombieDirection = zombieDirection * -1;
    }
    if (zy < 0 + 20) {
        zombieDirection = zombieDirection * -1;
    }
    if (zy % 150 == 0) {
        let pr = { 'x': zx + 25, 'y': zy + 10, 'p': 3, 'dir': -1 };
        projectiles.push(pr);
        socket.emit("shoot", pr, function (msg) {
            console.log(msg);
        });
    }

    let pr = { 'y': zy };
    socket.emit("zombiemove", pr, function (msg) { });


}
function updateScoreBoard() {
    $(".scores_home .point").html(gamersPoint);
    $(".scores_enemy .point").html(zombiePoint);
    if (gamersPoint < 75 && gamersPoint > 25) {
        $(".scores_home .life").addClass("orange");
    }
    if (gamersPoint < 25) {
        $(".scores_home .life").addClass("red");
    }
    if (zombiePoint < 75 && zombiePoint > 25) {
        $(".scores_enemy .life").addClass("orange");
    }
    if (zombiePoint < 25) {
        $(".scores_enemy .life").addClass("red");
    }
    $(".scores_home .life").css("width", gamersPoint + "%");
    $(".scores_enemy .life").css("width", zombiePoint + "%");
    if (gamersPoint == 0) {
        clearInterval(interval);
        $(".gameover").fadeIn(200);

    }
    if (zombiePoint == 0) {
        clearInterval(interval);
        $(".gameover").html("YOU WIN!");
        $(".gameover").addClass("winner");
        $(".gameover").fadeIn(200);

    }
}