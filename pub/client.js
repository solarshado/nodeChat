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

		var socket = io.connect().on('connect', function() {
			setupSocket(socket);
		});
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

		socket.on('chatMsg', function(data) {
			console.log("Received: " + data);
			appendMessage(Message(data));
		});

		// TODO expand Message to include
		// leave and join
		socket.on('join', appendJoin);
		socket.on('leave', appendLeave);
	}

	function appendMessage(msg) {
		// TODO fixme!
		logBox.val(logBox.val() + msg.toString() + "\n");
	}
	function appendJoin(who) {
		// TODO fixme!
		logBox.val(logBox.val() + who + " joined\n");
	}
	function appendLeave(who) {
		// TODO fixme!
		logBox.val(logBox.val() + who + " left\n");
	}
});
