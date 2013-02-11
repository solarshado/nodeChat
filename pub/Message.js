(function() { // private scope

function Message(a,b) {
	// TODO add date
	// TODO make this all-around better... ('-_-')->(self)
	var from, content, obj;
	if (b) {
		from = a;
		content = b;
	}
	else {
		obj = (typeof a === 'string') ? JSON.parse(a) : a;

		from = obj.from;
		content = obj.content;
	}
	return {'from': from, 'content': content, 'toString': messageToString };
}

function messageToString() {
	return this.from + " says: " + this.content;
}

if(typeof module === "object") {
	module.exports = Message;
}
else { // running in browser
	this.Message = Message;
}

})();
