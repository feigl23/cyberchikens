
class EventHandler {
    constructor() {
        this.socket = io();
        this.Connections();
        this.player = false;
    }
    Connections() {
        let ths = this;
        this.socket.on("connect", () => {
            console.log("connected");
            this.socket.emit("start", function (msg) { });
            this.player = new Player();
            ths.Prepare();
        });

        this.socket.on("disconnect", () => {
            console.log("disconnected");
        });
    }
    Prepare() {
        let ths = this;
        this.socket.on("inGame", function (msg) {
            ths.player.myID = msg.id;
            ths.player.x = 50 + (ths.player.myID * 170)
            for (let i in msg.playerpos) {
                if (i != ths.player.myID)
                    ths.player.players[i] = msg.playerpos[i];
            }
        });
        this.socket.on("startGame", function (msg) {
            let fps = 1000 / 24;
            $(".waiting").hide();
            $(".blanker").hide();
            ths.Display();
            ths.player.Start();

        });

        this.socket.on("newPlayer", function (msg) {
            ths.player.players[msg.id] = msg.y;
        });
    }
    Display() {
        let ths = this;
        this.socket.on("move", function (msg) {
            ths.player.players[msg.id] = msg.y;
        });
        this.socket.on("zombieMove", function (msg) {
            ths.player.zy = msg.y;
        });
        this.socket.on("shoot", function (msg) {
            ths.player.projectiles.push(msg);
        });
        this.socket.on("ChickenScore", function (msg) {
            ths.player.playersPoint = msg.playersPoint;
            ths.player.updateScoreBoard();
        });
        this.socket.on("ZombieScore", function (msg) {
            ths.player.zombiePoint = msg.zombiePoint;
            ths.player.updateScoreBoard();
        });
    }
}



