'use strict';

const socket = io.connect();

const localVideo = document.querySelector('.local-video video');
const videoGrid = document.querySelector('.default-grid');
const notification = document.querySelector('#notification');
const screenShareBtn = document.querySelector('#ShareBtn');
const localScreen = document.querySelector('#localScreen');
// localScreen.setAttribute('hidden', 'true');
let isNewUser = false;
const notify = (message) => {
	notification.innerHTML = message;
};

const pcConfig = {
	iceServers: [
		{
			urls: [
				'stun:stun.l.google.com:19302',
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
				'stun:stun3.l.google.com:19302',
				'stun:stun4.l.google.com:19302',
			],
		},
		{
			urls: 'turn:numb.viagenie.ca',
			credential: 'muazkh',
			username: 'webrtc@live.com',
		},
		{
			urls: 'turn:numb.viagenie.ca',
			credential: 'muazkh',
			username: 'webrtc@live.com',
		},
		{
			urls: 'turn:192.158.29.39:3478?transport=udp',
			credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			username: '28224511:1379330808',
		},
	],
};

/**
 * Initialize webrtc
 */
const webrtc = new Webrtc(socket, pcConfig, {
	log: true,
	warn: true,
	error: true,
});

// changing the video stream when screen-sharing
// const changeStream = (stream, socketId, isNewUser) => {
// 	if (isNewUser) {
// 		var videoContainer = document.createElement('div');
// 		videoContainer.setAttribute('class', 'grid-item');
// 		videoContainer.setAttribute('id', socketId);

// 		const video = document.createElement('video');
// 		video.setAttribute('autoplay', true);
// 		video.setAttribute('muted', true); // set to false
// 		video.setAttribute('playsinline', true);
// 		video.srcObject = stream;

// 		const p = document.createElement('p');
// 		p.textContent = socketId;

// 		videoContainer.append(p);
// 		videoContainer.append(video);
// 	} else {
// 	}
// };

/**
 * Create or join a room
 */
const roomInput = document.querySelector('#roomId');
const joinBtn = document.querySelector('#joinBtn');
joinBtn.addEventListener('click', () => {
	const room = roomInput.value;
	if (!room) {
		notify('Room ID not provided');
		return;
	}

	webrtc.joinRoom(room);
});

const setTitle = (status, e) => {
	const room = e.detail.roomId;

	console.log(`Room ${room} was ${status}`);

	notify(`Room ${room} was ${status}`);
	document.querySelector('h1').textContent = `Room: ${room}`;
	webrtc.gotStream();
};

webrtc.addEventListener('createdRoom', setTitle.bind(this, 'created'));
webrtc.addEventListener('joinedRoom', setTitle.bind(this, 'joined'));

/**
 * Leave the room
 */
const leaveBtn = document.querySelector('#leaveBtn');
leaveBtn.addEventListener('click', () => {
	webrtc.leaveRoom();
});
webrtc.addEventListener('leftRoom', (e) => {
	const room = e.detail.roomId;
	document.querySelector('h1').textContent = '';
	notify(`Left the room ${room}`);
});

/**
 * Get local media
 */
webrtc
	.getLocalStream(true, { width: 640, height: 480 })
	.then((stream) => (localVideo.srcObject = stream));

webrtc.addEventListener('kicked', () => {
	document.querySelector('h1').textContent = 'You were kicked out';
	videoGrid.innerHTML = '';
});

webrtc.addEventListener('userLeave', (e) => {
	console.log(`user ${e.detail.socketId} left room`);
});

/**
 * Handle new user connection
 */
webrtc.addEventListener('newUser', (e) => {
	const socketId = e.detail.socketId;
	const stream = e.detail.stream;
	isNewUser = true;

	// changeStream(stream, socketId, isNewUser);

	//Need Refactoring or handle for  screen sharing
	// const videoContainer = document.createElement('div');
	// videoContainer.setAttribute('class', 'grid-item');
	// videoContainer.setAttribute('id', socketId);

	const video = document.createElement('video');
	video.setAttribute('autoplay', true);
	video.setAttribute('muted', true); // set to false
	video.setAttribute('playsinline', true);
	video.srcObject = stream;

	// const p = document.createElement('p');
	// p.textContent = socketId;

	// videoGrid.append(p);
	videoGrid.append(video);

	screenShareBtn.addEventListener('click', () => {
		webrtc._shareScreen(socketId);
	});

	// // If user is admin add kick buttons
	// if (webrtc.isAdmin) {
	// 	const kickBtn = document.createElement('button');
	// 	kickBtn.setAttribute('class', 'kick_btn');
	// 	kickBtn.textContent = 'Kick';

	// 	kickBtn.addEventListener('click', () => {
	// 		webrtc.kickUser(socketId); //1
	// 	});

	// 	videoContainer.append(kickBtn);
	// }
	// videoGrid.append(videoContainer);
});

/**
 * Handle user got removed
 */
webrtc.addEventListener('removeUser', (e) => {
	const socketId = e.detail.socketId;
	if (!socketId) {
		// remove all remote stream elements
		videoGrid.innerHTML = '';
		return;
	}
	document.getElementById(socketId).remove();
});

/**
 * Handle errors
 */
webrtc.addEventListener('error', (e) => {
	const error = e.detail.error;
	console.error(error);

	notify(error);
});

/**
 * Handle notifications
 */
webrtc.addEventListener('notification', (e) => {
	const notif = e.detail.notification;
	console.log(notif);

	notify(notif);
});

// function showStream(stream, socketId) {
// 	const videoContainer = document.createElement('div');
// 	videoContainer.setAttribute('class', 'grid-item');
// 	videoContainer.setAttribute('id', socketId);

// 	const video = document.createElement('video');
// 	video.setAttribute('autoplay', true);
// 	video.setAttribute('muted', true); // set to false
// 	video.setAttribute('playsinline', true);
// 	video.srcObject = stream;

// 	const p = document.createElement('p');
// 	p.textContent = socketId;

// 	videoContainer.append(p);
// 	videoContainer.append(video);
// }
