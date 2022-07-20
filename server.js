

const PORT = process.env.PORT || 8000;
const INDEX = '/index.html';
const io = socketIO(server); // integrate our http server with a new instance of socket.io
const gameLogic = require("./game-logic");

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
// socket connection will go here

io.on("connection", client => {
  gameLogic.initaliseGame(io, client);
});

server.listen(process.env.PORT || 8000);