/** @typedef {"joined"|"left"|"said"|"userList"} MessageType */

/** @typedef {
 {type:"joined"|"left", who:string, what?:undefined, when:Date}|
 {type:"said", who:string, what:string, when:Date}|
 {type:"userList", who?:undefined, what:string[], when?:undefined}
 } MessageOpts
*/

export class Message {
	/** @type MessageType */
	#type;
	/** @type string */
	#who;
	/** @type string|string[] */
	#what;
	/** @type Date */
	#when;

	/** @param {MessageOpts} obj */
	constructor(obj) {
		const {type, who, what, when} = obj;
		this.#type = type;
		this.#who = who;
		this.#what = what;
		this.#when = new Date(when);
	}
	type() { return this.#type; }
	person() { return this.#who; }
	content() { return this.#what; }
	date() { return this.#when; }
	toJSON() {
		return JSON.stringify({
			type: this.#type,
			who: this.#who,
			what: this.#what,
			when: this.#when,
		});
	}

	/** @param {string} jsonString */
	static parse(jsonString) {
		return new Message(JSON.parse(jsonString));
	}

	/** @param {string} who */
	static joined(who, when = new Date()) {
		return new Message({'type': 'joined', 'who': who, 'when': when});
	}

	/** @param {string} who */
	static left(who, when = new Date()) {
		return new Message({'type': 'left', 'who': who, 'when': when});
	}

	/**
	* @param {string} who
	* @param {string} what
	*/
	static said(who, what, when = new Date()) {
		return new Message({'type': 'said', 'who': who, 'what': what, 'when': when});
	}

	/** @param {string[]} usernameArray */
	static userList(usernameArray) {
		return new Message({'type': 'userList', 'what': usernameArray});
	}
}

export default Message;
