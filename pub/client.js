$(document).ready(function() {
	var loginForm = $("form#loginForm"),
		loginStatus = $("span#loginStatus"),
		chatForm = $("form#chatForm"),
		aliasBox = $("input#name"),
		rememberMeCbx = $("input#rememberMe"),
		inputBox = $("input#message"),
		logBox = $("#messageLog"),
		userList = $("ul#userList"),
		storage = window.storage,
		hasStorage = storage !== null,
		socket = io.connect(),
		loggingIn = false,
		alias = "";

	setupSocket(socket);
	handleSavedUsername();

	$(window).focus(onWindowFocus).blur(onWindowBlur);

	loginForm.on('submit', function() {
		var alias_ = aliasBox.val().trim();
		if(!alias_) return false;

		alias = alias_;
		loggingIn = true;
		loginStatus.text("Logging in...");
		socket.emit('join', alias);

		if(hasStorage)
			if(rememberMeCbx.is(':checked'))
				storage.set("savedUsername", alias);
			else // clear remembered name
				storage.set("savedUsername", undefined);

		return false;
	});

	userList.on('click', "li", onUserNameClick);
	logBox.on('click', ".message .sender:not(.system)", onUserNameClick);
	logBox.on('click', "a", function() { inputBox.focus(); });

	function handleSavedUsername() {
		if(!hasStorage) {
			rememberMeCbx.attr("disabled", true);
			return;
		}

		var val = storage.get("savedUsername");
		if(val) {
			rememberMeCbx.prop('checked', true);
			aliasBox.val(val);
		}
	}

	function loginSucceeded() {
		loggingIn = false;
		loginStatus.text("Logged in!");
		loginForm.hide('slow');
		chatForm.show('slow', function() { inputBox.focus(); });
	}

	function loginFailed(message) {
		loggingIn = false;
		loginStatus.text("Login failed: " + message);
	}

	function setupSocket(socket) {
		chatForm.on('submit', function() {
			socket.emit('chatMsg', inputBox.val());
			inputBox.val('');
			inputBox.focus();
			return false;
		});

		socket.on('chatMsg', preParse(appendMessage));
		socket.on('join', preParse(appendMessage));
		socket.on('leave', preParse(appendMessage));
		socket.on('userList', preParse(updateUserList));
		socket.on('rejectUsername', loginFailed);
	}

	function preParse(func) {
		return function(data) {
			func(Message.parse(data));
		}
	}

	function appendMessage(msg) {
		var msgType = msg.type(),
			msgPerson = msg.person(),
			message = $('<div class="message" />'),
			sender = $('<span class="sender" />'),
			content = $('<span class="content" />');
		message.append(sender).append(" ").append(content);
		
		message.prop('title', msg.date());

		if(msgType === 'joined') {
			if(loggingIn && msgPerson === alias) {
				loginSucceeded();
				return;
			}
			else {
				sender.addClass('system');
				sender.text('Joined');
				content.text(msgPerson);
			}
		}
		else if(msgType === 'left') {
			sender.addClass('system');
			sender.text('Left');
			content.text(msgPerson);
		}
		else if(msgType === 'said') {
			sender.text(msgPerson);
			content.text(msg.content());
			linkifyUrls(content);
		}

		addMessageandScroll(message);

		if(msgType === 'joined' || msgType === 'left')
			updateUserList(msg);

		if(!document.hasFocus())
			TitleNotification.enable();

		searchForMyName(msg);
	}

	function addMessageandScroll(message) {
		var innerHeight = logBox.innerHeight(),
		    scrollHeight = logBox.prop("scrollHeight"),
		    scrollTop = logBox.prop("scrollTop");

		// grab sizes BEFORE adding the message
		logBox.append(message);

		// only scroll if scrolled to bottom beforehand
		if(((innerHeight + scrollTop) - scrollHeight) >= 0)
			logBox.scrollTop(scrollHeight);
	}

	function linkifyUrls(messageContent) {
		var html = messageContent.html(),
			urlMatcher = new RegExp("(\\w+://[^\\s]+)",'g'),
			linkTemplate = '<a target="_blank" rel="noreferrer" href="$&">$&</a>';

		html = html.replace(urlMatcher, linkTemplate);

		messageContent.html(html);
	}

	function searchForMyName(message) {
		if(message.type() !== "said") return;
		if(!TitleNotification.isEnabled()) return;

		var aliasTag = "@"+alias;

		if(message.content().indexOf(aliasTag) !== -1)
			TitleNotification.enableStar();
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

	function onUserNameClick() {
		var username = $(this).text(),
		    oldValue = inputBox.val();
		inputBox.val(oldValue + ('@'+username) + " ");
		inputBox.focus();
	}

	function onWindowFocus() {
		TitleNotification.disable();
	}

	function onWindowBlur() {
		$('.message.lastSeen').removeClass("lastSeen");
		$('.message').last().addClass("lastSeen");
	}
});
