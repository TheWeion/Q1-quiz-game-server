const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server); // integrate our http server with a new instance of socket.io
const gameLogic = require("./game-logic");

// socket connection will go here

io.on("connection", client => {
  gameLogic.initaliseGame(io, client);
});

server.listen(process.env.PORT || 8000); 