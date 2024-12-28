export class Game {

    constructor(player1, player2, roomId) {
        this.player1 = player1;
        this.player1.startTimer(roomId)
        this.player2 = player2;
        this.roomId = roomId;
    }

    attackPlayer(attackBy, move) {
        if (attackBy === this.player1.id) {
            if (this.player1.attack) {
                let opponentData = this.player2.gotAttack(move)
                if(!opponentData) return null
                this.player1.stopTimer();
                this.player2.startTimer(this.roomId);
                this.player1.attack = false;
                this.player2.attack = true;
                return {
                    [this.player2.id]: opponentData,
                    [this.player1.id]: {
                        destroyedShip: this.player1.getDestroyedShip(),
                        playerGrids: this.player1.playerGrids
                    }
                }
            } else return null

        } else {
            if (this.player2.attack) {
                let opponentData = this.player1.gotAttack(move)
                this.player2.attack = false;
                this.player1.attack = true;
                if(!opponentData)return null
                this.player2.stopTimer()
                this.player1.startTimer(this.roomId);
                return {
                    [this.player1.id]: opponentData,
                    [this.player2.id]: {
                        destroyedShip: this.player2.getDestroyedShip(),
                        playerGrids: this.player2.playerGrids,
                    }
                }
            } else return null

        }
    }
    hasPlayer(id){
        if(id == this.player1.id  || id == this.player2.id)
            return true;
        else return false;
    }
    opponentID(id){
        if(id == this.player1.id)
            return this.player2.id
        else return this.player1.id
    }

}


export class Player {
    constructor(id, playerShip, attack,io) {
        this.id = id;
        this.playerShip = playerShip;
        this.playerGrids = [];
        this.attack = attack;
        this.timeLeft = 20;
        this.io = io
    }
    gotAttack(move) {
        let hit = false;
        let ceckIfAlredy = this.playerGrids.find(i => i.position === move)
        if (ceckIfAlredy) return null;
        this.playerShip.map(element => {
            if (element.grids.includes(move)) {
                hit = true;
                element.grids = element.grids.filter(i => i !== move);
            }
        });
        const destroyedShip = this.playerShip.filter(ship => !ship.grids.length)
        this.playerGrids.push({ hit, position: move })
        return { destroyedShip: destroyedShip, playerGrids: this.playerGrids }
    }


    getDestroyedShip() {
        return this.playerShip.filter(ship => !ship.grids.length)
    }
    startTimer(roomId){
        console.log(roomId)
        this.timer = setInterval(() => {
            this.timeLeft--;
            if(this.timeLeft <= 0){
                clearInterval(this.timer)
                console.log(this.id)
                this.io.to(roomId).emit('timeup',{winner:this.id,reason:"Timeout"})
                console.log(roomId)
            }
        }, 1000);
    }
    stopTimer(){
        clearInterval(this.timer)
    }
}

