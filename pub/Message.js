(function() { // private scope

function Message(a,b) {
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
	return {'from': from, 'content': content};
}

if(typeof module === "object") {
	module.exports = Message;
}
else { // running in browser
	this.Message = Message;
}

})();
