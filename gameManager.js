/*
    GameManeger : 
    pendinguser
    array of rooms
    add user Remove user

*/

import { Game, Player } from "./game.js";

export class GameManeger {
    static pendingUser = null;
    static games = [];
    static io;
    static addGame(socket, playerShip) {
        let firstPlayer = new Player(this.pendingUser.socket.id, this.pendingUser.playerShip,true,this.io)
        let secondPlayer = new Player(socket.id, playerShip, false,this.io)
        let roomId = `${firstPlayer.id}+${secondPlayer.id}`
        this.games.push(new Game(firstPlayer, secondPlayer, roomId))
        this.pendingUser.socket.join(roomId);
        socket.join(roomId)
        return roomId;
    }
    static addPendingUser(socket, playerShip) {
        this.pendingUser = { socket, playerShip }
    }
    static attackPlayer(id, move) {
        //find player
        //attatck its opponent
        //return opponent ships state

        for (let game of this.games) {
            if (game.player1.id === id || game.player2.id === id) {
                let returnObj = game.attackPlayer(id, move)
                if (returnObj) {
                    return {
                        returnObj,
                        roomId: game.roomId
                    }
                } else return null;
            }
        }

        return null;
    }
    static removeGame(id) {
        if (this.pendingUser){
            if(this.pendingUser.socket.id === id)
                this.pendingUser = null;
        }
        else {
            let tempGame;
            this.games = this.games.filter(game => {
                if(game.hasPlayer(id))
                {
                    tempGame = game
                    return false;
                }else return true;
            })
            console.log(this.games)
            return tempGame
        }
    }
}