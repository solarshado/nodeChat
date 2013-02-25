$(document).ready(function() {
	//var socket = io.connect(window.location.host);
	var //socket, // = io.connect(),
	    loginForm = $("form#loginForm"),
	    chatForm = 	$("form#chatForm"),
	    aliasBox = $("input#name"),
	    inputBox = $("input#message"),
	    logBox = $("#messageLog");

	loginForm.on('submit', function() {
		if(!aliasBox.val()) return false;

		var socket = io.connect("", {'auto connect':false})
		socket.on('connect', function() {
			setupSocket(socket);
		});
		socket.socket.connect(); // this is bizare
		return false;
	});

	function setupSocket(socket) {
		var alias = aliasBox.val();
		socket.emit('join', alias);

		loginForm.hide('slow');
		chatForm.show('slow');

		chatForm.on('submit', function() {
			socket.emit('chatMsg', inputBox.val());
			inputBox.val('');
			return false;
		});

		socket.on('chatMsg', preParse(appendMessage));
		socket.on('join', preParse(appendJoin));
		socket.on('leave', preParse(appendLeave));
	}

	function preParse(func) {
		return function(data) {
			func(Message.parse(data));
		}
	}

	function appendMessage(msg) {
		var html = '<div class="message">' +
			   '<span class="sender">' + msg.person() + '</span>' +
			   '<span class="content">' + msg.content() + '</span>' +
			   '</div>';
		logBox.append(html);
	}
	function appendJoin(msg) {
		var html = '<div class="message">' +
			   '<span class="sender system">' + 'Joined' + '</span>' +
			   '<span class="content">' + msg.person() + '</span>' +
			   '</div>';
		logBox.append(html);
	}
	function appendLeave(msg) {
		var html = '<div class="message">' +
			   '<span class="sender system">' + 'Left' + '</span>' +
			   '<span class="content">' + msg.person() + '</span>' +
			   '</div>';
		logBox.append(html);
	}
});
