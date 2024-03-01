const socket = io(); //socketio connection to server//
var ctx, cns;
var interval;
var gfx = {};
var loadedAssetCount = 0;
var assetCount = 4;
var assets = ["chicken", "laserl", "laserr", "zombie"];
var x = 0;
var y = 30;
var myID = 0;
var players = {};
var projectiles = [];
var lastshot = 0;
var zx = 0;
var zy = 27;
var zombieWidth = 138;
var zombieDirection = 1;
var zombiePoint = 100;
var gamersPoint = 100;


$(document).ready(function () {
    cns = $("#gameStage")[0];
    ctx = cns.getContext("2d");
    zx = cns.width - zombieWidth;
    start();

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
                        // console.log(msg);
                    });
                    // console.log("shoot");
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
    // console.log("myID", myID, msg);
    for (i in msg.playerpos) {
        if (i != myID)
            players[i] = msg.playerpos[i];
    }
});

socket.on("newplayer", function (msg) {
    players[msg.id] = msg.y;
});

socket.on("move", function (msg) {
    // console.log(msg);
    players[msg.id] = msg.y;
});
socket.on("zombiemove", function (msg) {
    zy = msg.y;
});
socket.on("startgame", function (msg) {
    $(".waiting").hide();
    startAnim();
});
socket.on("scores", function (msg) {
    zombiePoint = msg.zombiePoint;
    gamersPoint = msg.gamersPoint;
    updateScoreBoard();
});

function loadGfx() {
    for (i in assets) {
        gfx[assets[i]] = new Image();
        gfx[assets[i]].src = "img/" + assets[i] + ".png";
    }
    for (g in gfx) {
        gfx[g].onload = function () {
            loadedAssetCount++;
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
    updateScoreBoard();
    loadGfx();
}

function startAnim() {
    if (loadedAssetCount >= assetCount) {
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
    if (zy > cns.height - zombieWidth) {
        zombieDirection = zombieDirection * -1;
    }
    if (zy < 0 + 20) {
        zombieDirection = zombieDirection * -1;
    }
    if (zy % 150 == 0) {
        let pr = { 'x': zx + 25, 'y': zy + 10, 'p': 3, 'dir': -1 };
        projectiles.push(pr);
        socket.emit("shoot", pr, function (msg) {
            // console.log(msg);
        });
    }

    let pr = { 'y': zy };
    socket.emit("zombiemove", pr, function (msg) { });


}
function updateScoreBoard() {
    $(".scores_home .point").html(gamersPoint);
    $(".scores_enemy .point").html(zombiePoint);
    checkPoints(gamersPoint,".scores_home .life");
    checkPoints(zombiePoint,".scores_enemy .life");
    $(".scores_home .life").css("width", gamersPoint + "%");
    $(".scores_enemy .life").css("width", zombiePoint + "%");
    if (gamersPoint == 0 ) 
        end(".gameover");
    if (zombiePoint == 0) {
        end(".winner");     
    }
}

function checkPoints(point, target) {
    if (point < 75 && point > 25) {
        $(target).addClass("orange");
    }
    if (point < 25) {
        $(target).addClass("red");
    }

}
function end(target){
    clearInterval(interval);
    $(target).css("display", "flex");
    $(target).fadeIn(200);
}