/** @typedef {
 {type:"joined"|"left", person:string, date:Date}|
 {type:"said", person:string, content:string, date:Date}|
 {type:"userList", content:string[]}
 } Message
*/

/** @typedef {Message["type"]} MessageType */

/** @enum MessageType */
export const MESSAGE_TYPE = Object.freeze({
	JOINED: 'joined',
	LEFT: 'left',
	SAID: 'said',
	USER_LIST: 'userList',
});

/**
* @param {string} jsonString
* @returns {Message}
*/
export function parse(jsonString) {
	const {type, person, date, content} = JSON.parse(jsonString);

	const isValidType = typeof type === "string" && (
		type === MESSAGE_TYPE.JOINED || type === MESSAGE_TYPE.LEFT ||
		type === MESSAGE_TYPE.SAID || type === MESSAGE_TYPE.USER_LIST);
	if(!isValidType)
		throw new Error(`invalid 'type' value: ${type}`);

	const isValidPerson = typeof person == "string";
	if(type !== MESSAGE_TYPE.USER_LIST && !isValidPerson)
		throw new Error(`invalid 'person' value: ${person}`);

	if(type === MESSAGE_TYPE.SAID && typeof content !== "string")
		throw new Error(`invalid 'content' value for type=MESSAGE_TYPE.SAID: ${content}`);

	if(type === MESSAGE_TYPE.USER_LIST &&
		!(Array.isArray(content) && typeof content[0] === "string"))
		throw new Error(`invalid 'content' value for type=MESSAGE_TYPE.USER_LIST: ${content}`);

	return {type, person, date: new Date(date), content};
}

/**
* @param {string} who
* @returns {Message}
*/
export function joined(who, when = new Date()) {
	return {type: MESSAGE_TYPE.JOINED, person: who, date: when};
}

/**
* @param {string} who
* @returns {Message}
*/
export function left(who, when = new Date()) {
	return {type: MESSAGE_TYPE.LEFT, person: who, date: when};
}

/**
* @param {string} who
* @param {string} what
* @returns {Message}
*/
export function said(who, what, when = new Date()) {
	return {type: MESSAGE_TYPE.SAID, person: who, content: what, date: when};
}

/** @param {string[]} usernameArray
* @returns {Message}
*/
export function userList(usernameArray) {
	return {type: MESSAGE_TYPE.USER_LIST, content: usernameArray};
}

export default {joined, left, said, userList, parse};
