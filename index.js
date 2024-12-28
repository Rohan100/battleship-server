import { Server } from "socket.io";
import { createServer } from 'http'
import express from 'express'
import { GameManeger } from "./gameManager.js";

const app = express()


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})
GameManeger.io = io;
io.to()
io.on('connection', socket => {
    socket.on('start',(data)=>{
        if(GameManeger.pendingUser){
            let roomId = GameManeger.addGame(socket,data.ships)
            io.to(roomId).emit('gameStart',{firstToPlay : GameManeger.pendingUser.socket.id  })
            GameManeger.pendingUser = null;
            console.log(GameManeger.pendingUser);

        }else{
            console.log("else d")
            GameManeger.addPendingUser(socket,data.ships,io)
        }
    socket.on('playerMove',(data)=>{
        let returnObj = GameManeger.attackPlayer(socket.id,data.move)
        if(returnObj){
            io.to(returnObj.roomId).emit('attack',returnObj.returnObj)
            const keys = Object.keys(returnObj.returnObj);
            if(returnObj.returnObj[keys[0]].destroyedShip.length === 5){
                io.to(returnObj.roomId).emit('winner',{winner:keys[1]});
            }else if(returnObj.returnObj[keys[1]].destroyedShip.length === 5){
                io.to(returnObj.roomId).emit('winner',{winner:keys[0]});
            }
        }
    })

  
    socket.broadcast
    socket.on('disconnect',(reason)=>{
        let game = GameManeger.removeGame(socket.id);
        if(game){
            io.to(game.opponentID(socket.id)).emit('winner',{winner:game.opponentID(socket.id),reason:"Opponent Disconnected"})
        }
    })
})
   

    // socket.on('playerMove', (data) => {
    //     const { roomId, move } = data;
    
    //     // Broadcast the move to the other player
    //     socket.to(roomId).emit('opponentMove', move);
    
    //     // Switch timers: Stop current player's timer, start opponent's timer
    //     // Start opponent's timer
    //   });

})

server.listen(5000, () => {
    console.log("server is running on  5000")
})