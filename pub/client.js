$(document).ready(function() {
	var loginForm = $("form#loginForm"),
		chatForm = $("form#chatForm"),
		aliasBox = $("input#name"),
		inputBox = $("input#message"),
		logBox = $("#messageLog"),
		userList = $("ul#userList");

	$(window).focus(TitleNotification.disable);

	loginForm.on('submit', function() {
		if(!aliasBox.val()) return false;

		var socket = io.connect("", {'auto connect':false})
		socket.on('connect', function() {
			setupSocket(socket);
		});
		socket.connect();
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
		socket.on('userList', preParse(updateUserList));
	}

	function preParse(func) {
		return function(data) {
			func(Message.parse(data));
		}
	}

	function appendMessage(msg) {
		var msgType = msg.type(),
			message = $('<div class="message" />'),
			sender = $('<span class="sender" />'),
			content = $('<span class="content" />');
		message.append(sender).append(content);
		
		message.prop('title', msg.date());

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

		linkifyUrls(content);

		logBox.append(message);
		logBox.scrollTop(logBox.prop('scrollHeight'));

		if(msgType === 'joined' || msgType === 'left')
			updateUserList(msg);

		if(!document.hasFocus())
			TitleNotification.enable();
	}

	function linkifyUrls(messageContent) {
		var html = messageContent.html(),
			urlMatcher = new RegExp("(\\w+://[^\\s]+)",'g'),
			linkTemplate = '<a target="_blank" href="$&">$&</a>';

		html = html.replace(urlMatcher, linkTemplate);

		messageContent.html(html);
	}

	function updateUserList(msg) {
		var msgType = msg.type(),
			who = msg.person(),
			list = msg.content();
		
		if(msgType === 'joined') {
			userList.append(buildListItem(who));
		}
		else if(msgType === 'left') {
			getListItem(who).remove();
		}
		else if(msgType === 'userList') {
			userList.children('li').remove();
			$.each(list, function(i, val) {
				userList.append(buildListItem(val));
			});
		}

		function getListItem(username) {
			return userList
				.children()
				.filterByData('username', username);
		}
		function buildListItem(username) {
			return $('<li />')
				.text(username)
				.data('username',username);
		}
	}
});
