let dataObject = require('./DataObject.js');
let curIo;
let curSocket;

let dataArray = [];
let MAX_PLAYERS_PER_ROOM = 2;
//let MAX_PLAYERS_PER_ROOM = 4;

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
	let roomId = getRoomIdInternal(id);
	let rooms = curIo.sockets.adapter.rooms;
	let room = rooms.get(roomId);
	let posId = getRoomSize(roomId);
	if (room === undefined) {
		curSocket.join(roomId);	
		let afterJoin = getRoomSize(roomId);
		let newRoom = resetRoomInternal(id);
		newRoom.players[posId].name = data.name;
		updateRoomInternal(id, newRoom);
		curSocket.emit('yourId', {yourId: posId});
		curIo.to(getRoomIdInternal(data.roomId)).emit('joinRoom', {status: "OK", msg: afterJoin + " player(s) in room. Waiting " + (MAX_PLAYERS_PER_ROOM - afterJoin) + " player(s) to join."});
	} else {
		if (getRoomSize(roomId) < MAX_PLAYERS_PER_ROOM) {
			curSocket.join(roomId);
			let afterJoin = getRoomSize(roomId);
			let curRoom = getRoomInternal(id);
			curRoom.players[posId].name = data.name;
			updateRoomInternal(id, curRoom);
			curSocket.emit('yourId', {yourId: posId});
			curIo.to(getRoomIdInternal(data.roomId)).emit('joinRoom', {status: "OK", msg: afterJoin + " player(s) in room. Waiting " + (MAX_PLAYERS_PER_ROOM - afterJoin) + " player(s) to join."});
		} else {
			curSocket.emit('joinRoom', {msg: "This room is full!"});
		}
	}
};

const getPlayers = (data) => {
	curIo.to(getRoomIdInternal(data.roomId)).emit('getPlayers', {status: "OK", msg: "getPlayers OK", data: getRoomInternal(data.roomId).players});
};

const updatePlayer = (data) => {
	updatePlayerInternal(data.roomId, data.playerId, data.player);
	curIo.to(getRoomIdInternal(data.roomId)).emit('updatePlayer', {status: "OK", msg: "updatePlayer OK", data: getRoomInternal(data.roomId).players});
};

const playerReady = (data) => {
	let player = playerReadyInternal(data.roomId, data.playerId);
	console.log('Room: ' + data.roomId + ' ID: ' + player.id + ' Player: ' + player.name + ' is ready.');
	curIo.to(getRoomIdInternal(data.roomId)).emit('playerReady', {status: "OK", msg: "Player " + player.name + " is ready!"});
};

const getQuestions = (data) => {
	curIo.to(getRoomIdInternal(data.roomId)).emit('getQuestions', {status: "OK", msg: "getQuestions OK", data: getRoomInternal(data.roomId).questions});
}

const updateQuestions = (data) => {
	updateQuestionsInternal(data.roomId, data.questions);
	curIo.to(getRoomIdInternal(data.roomId)).emit('updateQuestions', {status: "OK", msg: "updateQuestions OK"});
};

/****** INTERNAL FUNCTION ******/

const getRoomIdInternal = (id) => {
	return 'room-' + id;
};

const resetRoomInternal = (roomId) => {
	let newRoom = dataObject;
	dataArray[roomId] = newRoom;
	return newRoom;
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
	let size = 0;
	try {
		let rooms = curIo.sockets.adapter.rooms;
		let room = rooms.get(roomId);
		size = room.size;
	} catch(err) {}
	return size;
};

exports.handleRoom = handleRoom;