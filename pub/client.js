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
		socket.on('join', preParse(appendMessage));
		socket.on('leave', preParse(appendMessage));
	}

	function preParse(func) {
		return function(data) {
			func(Message.parse(data));
		}
	}

	function appendMessage(msg) {
		var message = $('<div class="message" />'),
		    sender = $('<span class="sender" />'),
		    content = $('<span class="content" />');
		message.append(sender).append(content);
		
		message.prop('title', msg.date());

		var msgType = msg.type();
		if(msgType === 'joined') {
			sender.addClass('system');
			sender.text('Joined');
			content.text(msg.person());
		}
		else if(msgType === 'left') {
			sender.addClass('system');
			sender.text('Left');
			content.text(msg.person());
		}
		else if(msgType === 'said') {
			sender.text(msg.person());
			content.text(msg.content());
		}

		logBox.append(message);
		logBox.scrollTop(logBox.prop('scrollHeight'));
	}
});
