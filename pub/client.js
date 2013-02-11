$(document).ready(function() {
	//var socket = io.connect(window.location.host);
	var socket = io.connect(),
	    inputBox = $("input#message"),
	    logBox = $("#messageLog");

	$("form#chatform").on('submit', function() {
		socket.emit('chatMsg', inputBox.val());
		inputBox.val('');
		return false;
	});

	socket.on('chatMsg', function(data) {
		console.log("Received: " + data);
		appendMessage(Message(data));
	});

	function appendMessage(msg) {
		logBox.val(logBox.val() + msg.toString() + "\n");
	}
});
