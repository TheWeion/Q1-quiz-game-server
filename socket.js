const express = require("express")
const serverIO = require("http").createServer(server);
const cors = require("cors");
const io = require("socket.io")(serverIO); // integrate our http server with a new instance of socket.io
const gameLogic = require("./game-logic");

// socket connection will go here

const app = express();

app.use(cors('*'));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");

});

io.on("connection", client => {
  gameLogic.initaliseGame(io, client);
});

module.exports = server;