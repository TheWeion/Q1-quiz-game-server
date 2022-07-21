let io;
let gameSocket;

let gamesInSession = [];

const initaliseGame = (sIo, socket) => {
	io = sIo;
	gameSocket = socket;

	gamesInSession.push(gameSocket);

	gameSocket.on('pingTest', pingTest);
	gameSocket.on('disconnect', onDisconnect);
	gameSocket.on('createNewGame', createNewGame);
	gameSocket.on('playerJoinsGame', playerJoinsGame);
	gameSocket.on('requestUserName', requestUserName);
	gameSocket.on('recievedUserName', recievedUserName);
	gameSocket.on('userEvent', userEvent);
}

const pingTest = () => {
	this.emit('message', "Hi!");
};

const onDisconnect = () => {
	let i = gamesInSession.indexOf(gameSocket);
	gamesInSession.splice(i, 1);
};

const createNewGame = () => {
	this.emit('createNewGame', {gameId: gameId, mySocketId: this.id});
	this.join(gameId);
};

const playerJoinsGame = (idData) => {
	let sock = this
	let room = io.sockets.adapter.rooms[idData.gameId]

	if (room === undefined) {
		this.emit('status', "This game session does not exist!");
		return;
	};

	if (room.length < 4) {
		idData.mySocketID = sock.id;

		sock.join(idData.gameId);

		if (room.length === 4) {
			io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);
		};
	} else {
		this.emit('status', "This game session is full!");
	};
};

const requestUserName = (gameId) => {
	io.to(gameId).emit('setUsername', this.id);
};

const recievedUserName = (data) => {
	data.socketId = this.id;
	io.to(data.gameId).emit('getUserName', this.id);
};

const userEvent = (e) => {
	const gameId = e.gameId;

	io.to(gameId).emit('userEvent', e);
};

exports.initaliseGame = initaliseGame;