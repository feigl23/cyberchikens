
class Player {
    constructor() {
        this.cns = $("#gameStage")[0];
        this.ctx = this.cns.getContext("2d");
        this.interval = false;
        this.gfx = {};
        this.loadedAssetCount = 0;
        this.assetCount = 4;
        this.myID = 0;
        this.x = 0;
        this.y = 30;
        this.players = {};
        this.projectiles = [];
        this.lastshot = 0;
        this.todel = [];
        this.zombieWidth = 138;
        this.zombieDirection = 1;
        this.zx = this.cns.width - this.zombieWidth;
        this.zy = 27;
        this.zombiePoint = 100;
        this.playersPoint = 100;
        this.LoadGfx();
        this.updateScoreBoard();
        this.InputHandler();

    }
    LoadGfx() {
        let assets = ["chicken", "laserl", "laserr", "zombie"];
        for (let i in assets) {
            this.gfx[assets[i]] = new Image();
            this.gfx[assets[i]].src = "img/" + assets[i] + ".png";
        }
        let ths = this;
        for (let g in this.gfx) {
            this.gfx[g].onload = function () {
                ths.loadedAssetCount++;
            };
        }
    }
    Start() {
        if (this.loadedAssetCount >= this.assetCount) {
            var ths = this;
            this.interval = setInterval(function () {
                ths.Animations(ths);
            }, 1000 / 24);

        }
    }
    updateScoreBoard() {
        checkPoints(this.playersPoint, ".scores_home .life", ".scores_home .point");
        checkPoints(this.zombiePoint, ".scores_enemy .life", ".scores_enemy .point");
        if (this.playersPoint == 0)
            this.End(".gameover");
        if (this.zombiePoint == 0) {
            this.End(".winner");
        }
        function checkPoints(point, life, pointScreen) {
            $(pointScreen).html(point);
            if (point < 75 && point > 25) {
                $(life).addClass("orange");
            }
            if (point < 25) {
                $(life).addClass("red");
            }
            $(life).css("width", point + "%");
        }
    }
    Animations(ths) {
        ths.ClearCanvas();
        ths.Draw('chicken', ths.x, ths.y);
        if (ths.myID == 0) {
            ths.Zombie();
        }
        ths.Draw('zombie', ths.zx, ths.zy);
        for (let i in ths.players) {
            ths.Draw('chicken', 50 + (i * 170), ths.players[i]);
        }
        ths.DrawLaser();
    }
    InputHandler() {
        let ths = this;
        $(document).keydown(function (e) {
            let move = false;
            switch (e.keyCode) {
                case 38: // up
                    ths.y = ths.y - 10;
                    move = true;
                    break;
                case 40: // down
                    ths.y = ths.y + 10;
                    move = true;
                    break;
                case 32: // space
                    if ((Date.now() - ths.lastshot) > 1000) {
                        ths.lastshot = Date.now();
                        let pr = { 'x': 70 + (ths.myID * 170), 'y': ths.y, 'p': ths.myID, 'dir': 1 };
                        ths.projectiles.push(pr);
                        events.socket.emit("shoot", pr, function (msg) {
                        });
                    }
                    break;
            }
            if (ths.y < 0) ths.y = 0;
            if (ths.y > 615) ths.y = 615;
            if (move) {
                let pr = { 'y': ths.y, 'id': ths.myID };
                events.socket.emit("move", pr, function (msg) { });
            }
        });

    }
    Draw(image, x, y) {
        this.ctx.drawImage(this.gfx[image], x, y);
    }
    ClearCanvas() {
        this.ctx.clearRect(0, 0, this.cns.width, this.cns.height);
    }
    Zombie() {
        let zBottom = 20;
        let zShoot = 150;
        this.zy += 3 * this.zombieDirection;
        if (this.zy > (this.cns.height - this.zombieWidth)) {
            this.zombieDirection = this.zombieDirection * -1;
        }
        if (this.zy < zBottom) {
            this.zombieDirection = this.zombieDirection * -1;
        }
        if (this.zy % zShoot == 0) {
            let pr = { 'x': (this.zx + 25), 'y': (this.zy + 10), 'p': 3, 'dir': -1 };
            this.projectiles.push(pr);
            events.socket.emit("shoot", pr, function (msg) {
            });
        }

        let pr = { 'y': this.zy };
        events.socket.emit("zombieMove", pr, function (msg) { });


    }
    DrawLaser() {
        this.todel = [];
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].x += (20 * this.projectiles[i].dir);
            if (this.projectiles[i].dir == -1) {
                this.Draw('laserl', this.projectiles[i].x, this.projectiles[i].y);
            } else {
                this.Draw('laserr', this.projectiles[i].x, this.projectiles[i].y);
            }
            if (this.projectiles[i].x > this.cns.width || this.projectiles[i].x < 0) {
                this.todel.push(i);
            }
            if (this.projectiles[i].dir == -1) {
                this.ChickenCollision(i);
            } else {
                this.ZombieCollision(i);
            }
        }
        DeleteLaser(this);
        function DeleteLaser(ths) {
            for (let i = ths.todel.length - 1; i >= 0; i--) {
                ths.projectiles.splice(ths.todel[i], 1);
            }
        }
    }
    ChickenCollision(i) {
        if (this.x + 55 >= this.projectiles[i].x &&
            this.y <= this.projectiles[i].y &&
            this.y + 64 >= this.projectiles[i].y) {
            this.Shooted(false, i);
        }
        for (let j in this.players) {
            let bx = (j * 170) + 105;
            let by = this.players[j] + 64;
            if (bx >= this.projectiles[i].x &&
                this.players[j] <= this.projectiles[i].y &&
                by >= this.projectiles[i].y) {
                this.todel.push(i);
            }
        }
    }
    ZombieCollision(i) {
        if (this.zx <= this.projectiles[i].x &&
            this.zy - 5 <= this.projectiles[i].y &&
            (this.zy + 128) >= this.projectiles[i].y) {
            this.Shooted(true, i);
        }
    }
    Shooted(enemy, i) {
        let ths = this;
        let pr = {};
        this.todel.push(i);
        if (enemy) {
            if (this.myID == 0) {
                this.zombiePoint -= 25;
                pr.zombiePoint = this.zombiePoint;
                events.socket.emit("ZombieScore", pr, function (msg) {
                    ths.updateScoreBoard();
                });
            }
        } else {
            this.playersPoint -= 25;
            pr.playersPoint = this.playersPoint;
            events.socket.emit("ChickenScore", pr, function (msg) {
                ths.updateScoreBoard();
            });
        }

    }


    End(target) {
        clearInterval(this.interval);
        this.interval = false;
        $(target).css("display", "flex");
        $(".blanker").show();
        $(target).fadeIn(200);
    }


}






