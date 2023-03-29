import storage from "./storage.js";

import { default as Message, MESSAGE_TYPE } from "./Message.js";
/** @typedef {import("./Message.js").Message} Message */
import TitleNotification from "./TitleNotification.js";

import { io } from "socket.io-client";

const hasStorage = storage !== null;

/** @type HTMLFormElement */
const loginForm = document.querySelector("form#loginForm");
/** @type HTMLSpanElement */
const loginStatus = document.querySelector("span#loginStatus");
/** @type HTMLFormElement */
const chatForm = document.querySelector("form#chatForm");
/** @type HTMLInputElement */
const sendButton = chatForm.querySelector("input[type='submit']");
/** @type HTMLInputElement */
const aliasBox = document.querySelector("input#name");
/** @type HTMLInputElement */
const rememberMeCbx = document.querySelector("input#rememberMe");
/** @type HTMLInputElement */
const inputBox = document.querySelector("input#message");
/** @type HTMLDivElement */
const logBox = document.querySelector("div#messageLog");
/** @type HTMLUListElement */
const userList = document.querySelector("ul#userList");
/** @type HTMLTemplateElement */
const normalMessageTemplate = document.querySelector("template#normalMessageTemplate");
/** @type HTMLTemplateElement */
const systemMessageTemplate = document.querySelector("template#systemMessageTemplate");

const socket = io();

let loggingIn = false;
let alias = "";

setupSocket(socket);
handleSavedUsername();

window.addEventListener("focus", onWindowFocus);
window.addEventListener("blur", onWindowBlur);

loginForm.addEventListener("submit", function(evt) {
	evt.preventDefault();
	const alias_ = aliasBox.value.trim();
	if(!alias_)
		return;

	alias = alias_;
	loggingIn = true;
	loginStatus.textContent = "Logging in...";
	socket.emit('join', alias);

	if(hasStorage) {
		if(rememberMeCbx.checked)
			storage.set("savedUsername", alias);
		else // clear remembered name
			storage.set("savedUsername", undefined);
	}
});

/** @param {Function} handler */
const filterTarget = (tgtSelector,handler) =>
	function (evt) {
		/** @type HTMLElement */
		const tgt = evt.target;
		if(!tgt.matches(tgtSelector)) return;
		handler.call(this, evt);
	};

userList.addEventListener('click', filterTarget("li", onUserNameClick));
logBox.addEventListener('click', filterTarget(".message .sender:not(.system)", onUserNameClick));

logBox.addEventListener('click', filterTarget("a",()=> inputBox.focus()));

function updateSendButtonEnabled() {
	sendButton.disabled = !inputBox.value.trim();
}

inputBox.addEventListener('input', updateSendButtonEnabled);
inputBox.addEventListener('keyup', updateSendButtonEnabled);

function handleSavedUsername() {
	if(!hasStorage) {
		rememberMeCbx.disabled = true;
		return;
	}

	const val = storage.get("savedUsername");
	if(val) {
		rememberMeCbx.checked = true;
		aliasBox.value = val;
	}
}

function loginSucceeded() {
	loggingIn = false;
	loginStatus.textContent = "Logged in!";
	/* TODO? port transition/animation
	loginForm.hide('slow');
	chatForm.show('slow', function() { inputBox.focus(); });
	*/
	loginForm.style.display = "none";
	chatForm.style.display = "block";
	inputBox.focus();
}

function loginFailed(message) {
	loggingIn = false;
	loginStatus.textContent = "Login failed: " + message;
}

function setupSocket(socket) {
	chatForm.addEventListener('submit', function(evt) {
		evt.preventDefault()
		socket.emit('chatMsg', inputBox.value.trim());
		inputBox.value = "";
		inputBox.focus();
		updateSendButtonEnabled();
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

/** @param {Message} msg */
function appendMessage(msg) {
	if(msg.type === MESSAGE_TYPE.USER_LIST)
		return; // we don't do that here

	const { type, person } = msg;

	/** @type {(s:string, c:string, d:Date, iS:boolean)=>HTMLElement} */
	function mkMessage(sender, content, date, isSystem) {
		const elem = /** @type HTMLElement */
			((isSystem ? systemMessageTemplate : normalMessageTemplate)
			.content.cloneNode(true));

		elem.title = date.toString();
		elem.querySelector(".sender").textContent = sender;
		const contentEl = elem.querySelector(".content")
		contentEl.textContent = content;
		linkifyUrls(contentEl);

		return elem;
	}

	let message;
	if(type === MESSAGE_TYPE.JOINED) {
		if(loggingIn && person === alias) {
			loginSucceeded();
			return;
		}
		else {
			message = mkMessage("Joined",person,msg.date,true);
		}
	}
	else if(type === MESSAGE_TYPE.LEFT) {
		message = mkMessage("Left",person,msg.date,true);
	}
	else if(type === MESSAGE_TYPE.SAID) {
		message = mkMessage(person,msg.content,msg.date,false);
	}

	addMessageAndScroll(message);

	if(type === MESSAGE_TYPE.JOINED || type === MESSAGE_TYPE.LEFT)
		updateUserList(msg);

	if(!document.hasFocus())
		TitleNotification.enable();

	searchForMyName(msg);
}

/** @param {HTMLElement} message */
function addMessageAndScroll(message) {
	// from jQuery's .innerHeight()
	// TODO try to simplify
	// see https://thisthat.dev/client-height-vs-offset-height-vs-scroll-height/
	const innerHeight = Math.max(logBox.scrollHeight, logBox.offsetHeight, logBox.clientHeight)

	const scrollHeight = logBox.scrollHeight;
	const scrollTop = logBox.scrollTop;

	// grab sizes BEFORE adding the message
	logBox.append(message);

	// only scroll if scrolled to bottom beforehand
	if(((innerHeight + scrollTop) - scrollHeight) >= 0)
		logBox.scrollTop = scrollHeight;
}

/** @param {Element} messageContent */
function linkifyUrls(messageContent) {
	const originalText = messageContent.textContent;
	const urlMatcher = new RegExp(String.raw`(\w+://[^\s]+)`);

	function mkLink(url) {
		const elem = document.createElement("a");
		elem.target = "_blank";
		elem.rel = "noreferrer";
		elem.href = elem.textContent = url;
		return elem;
	}

	// not sure how to avoid repeated regex execution here without
	// hurting readability
	const newContent = originalText.split(urlMatcher).map(s=>
		urlMatcher.test(s) ? mkLink(s) : s
	)

	messageContent.replaceChildren(...newContent);
}

/** @param {Message} message */
function searchForMyName(message) {
	if(message.type !== MESSAGE_TYPE.SAID)
		return;
	if(!TitleNotification.isEnabled())
		return;

	const aliasTag = "@"+alias;

	if(message.content.indexOf(aliasTag) !== -1)
		TitleNotification.enableStar();
}

/** @param {Message} msg */
function updateUserList(msg) {
	const { type } = msg;

	if(type === MESSAGE_TYPE.JOINED) {
		userList.append(buildListItem(msg.person));
	}
	else if(type === MESSAGE_TYPE.LEFT) {
		for(const child of userList.children)
			if(/** @type HTMLElement */(child).dataset["username"] === msg.person)
				child.remove();
	}
	else if(type === MESSAGE_TYPE.USER_LIST) {
		userList.replaceChildren(...msg.content.map(buildListItem));
	}

	function buildListItem(username) {
		const elem = document.createElement("li");
		elem.textContent = username;
		elem.dataset["username"] = username;
		return elem;
	}
}

/** @param {MouseEvent} event */
function onUserNameClick(event) {
	const username = /** @type HTMLElement */(event.target).textContent;
	inputBox.value += ('@' + username + " ");
	inputBox.focus();
	updateSendButtonEnabled();
}

function onWindowFocus() {
	TitleNotification.disable();
}

function onWindowBlur() {
	document.querySelectorAll('.message.lastSeen').forEach(m=>m.classList.remove("lastSeen"));
	document.querySelector('.message:last-of-type')?.classList.add("lastSeen");
}
