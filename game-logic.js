let roomObject = require('./RoomObject.js');
let curIo;
let curSocket;

let dataArray = [];
let socketArray = [];
socketArray[2] = [];
socketArray[3] = [];
socketArray[4] = [];

const handleRoom = (io, socket) => {
	curIo = io;
	curSocket = socket;

	curSocket.on('joinRoom', joinRoom);
	curSocket.on('getPlayers', getPlayers);
	curSocket.on('updatePlayer', updatePlayer);
	curSocket.on('playerReady', playerReady);
	curSocket.on('getQuestions', getQuestions);
	curSocket.on('updateQuestions', updateQuestions);
}

const joinRoom = (data) => {
	let id = data.roomId;
	let playerName = data.name;
	let numberOfPlayer = id;
	let roomId = getRoomIdForSocket(id);
	let posId = getRoomSize(id);
	if (getRoomSize(id) < numberOfPlayer) {
		curSocket.join(roomId);
		if (posId === 0) {
			socketArray[id] = [];
			kickPlayerInRoomInternal(id);
			createRoomInternal(id);
		}
		socketArray[id].push(curSocket);
		let afterJoin = getRoomSize(id);
		let curRoom = getRoomInternal(id);
		curRoom.players[posId].name = playerName;
		updateRoomInternal(id, curRoom);
		console.log(`Room: ${id} player: ${playerName} join, player ID is: ${posId}`);
		curSocket.emit('yourId', {yourId: posId});
		curIo.to(getRoomIdForSocket(data.roomId)).emit('joinRoom', {status: "OK", msg: afterJoin + " player(s) in room. Waiting " + (numberOfPlayer - afterJoin) + " player(s) to join."});
	} else {
		console.log('Room: ' + id + ' is full.');
		curSocket.emit('joinRoom', {msg: "This room is full!"});
	}
};

const getPlayers = (data) => {
	curIo.to(getRoomIdForSocket(data.roomId)).emit('getPlayers', {status: "OK", msg: "getPlayers OK", data: getRoomInternal(data.roomId).players});
};

const updatePlayer = (data) => {
	updatePlayerInternal(data.roomId, data.playerId, data.player);
	curIo.to(getRoomIdForSocket(data.roomId)).emit('updatePlayer', {status: "OK", msg: "updatePlayer OK", data: getRoomInternal(data.roomId).players});
};

const playerReady = (data) => {
	let player = playerReadyInternal(data.roomId, data.playerId);
	console.log('Room: ' + data.roomId + ' ID: ' + player.id + ' Player: ' + player.name + ' is ready.');
	curIo.to(getRoomIdForSocket(data.roomId)).emit('playerReady', {status: "OK", msg: "Player " + player.name + " is ready!"});
};

const getQuestions = (data) => {
	curIo.to(getRoomIdForSocket(data.roomId)).emit('getQuestions', {status: "OK", msg: "getQuestions OK", data: getRoomInternal(data.roomId).questions});
}

const updateQuestions = (data) => {
	updateQuestionsInternal(data.roomId, data.questions);
	curIo.to(getRoomIdForSocket(data.roomId)).emit('updateQuestions', {status: "OK", msg: "updateQuestions OK"});
};

/****** INTERNAL FUNCTION ******/

const getRoomIdForSocket = (id) => {
	return 'room-' + id;
};

const kickPlayerInRoomInternal = (roomId) => {
	let numberOfPlayer = socketArray[roomId].length;
	for (let ind = 0; ind < numberOfPlayer; ind++) {
		let curSocket = socketArray[roomId][ind];
		curSocket.leave(getRoomIdForSocket(roomId));
	}
	console.log('Room: ' + roomId + ' kicked: ' + numberOfPlayer + ' player(s).');
};

const createRoomInternal = (roomId) => {
	let newRoom = roomObject;
	let numberOfPlayer = roomId;
	for (let ind = 0; ind < numberOfPlayer; ind++) {
		newRoom.players[ind] = {
			"id": ind,
			"name": "Player " + (ind + 1).toString(),
			"lap": 0, 
			"timer": 0,
			"penalty": 0,
			"drs_used": false,
			"pit_entered": false,
			"finish": false,
			"is_ready": false
		};
	}
	dataArray[roomId] = newRoom;
	console.log('Room: ' + roomId + ' has reset.');
};

const getRoomInternal = (roomId) => {
	let room = dataArray[roomId];
	return room;
};

const updateRoomInternal = (roomId, room) => {
	dataArray[roomId] = room;
};

const updatePlayerInternal = (roomId, playerId, player) => {
	dataArray[roomId].players[playerId] = player;
};

const playerReadyInternal = (roomId, playerId) => {
	dataArray[roomId].players[playerId].is_ready = true;
	return dataArray[roomId].players[playerId];
};

const updateQuestionsInternal = (roomId, questions) => {
	dataArray[roomId].questions = questions;
};

const getRoomSize = (roomId) => {
	return socketArray[roomId].length;
};

exports.handleRoom = handleRoom;