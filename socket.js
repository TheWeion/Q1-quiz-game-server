const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server,{
  cors: {
      //origin: "http://localhost:3000",
      origin: "https://q1-fp.netlify.app"
  }
}); // integrate our http server with a new instance of socket.io

/*
*/

const cors = require("cors");
const gameLogic = require("./game-logic");

// socket connection will go here

app.use(cors('*'));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");

});

io.on("connection", client => {
  gameLogic.handleRoom(io, client);
});

module.exports = server;