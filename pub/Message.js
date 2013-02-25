(function() { // private scope

var message = {};

function Message(data) {
	var //type = data.type,
	    //person = data.who,
	    //content = data.what,
	    date = new Date(data.when);
	return {
		'type': function() { return data.type; },
		'person': function() { return data.who; },
		'content': function() { return data.what; },
		'date': function() { return date; },
		'toJSON': function() { return JSON.stringify(data); }
		};
}

message.parse = function(jsonString) {
	return new Message(JSON.parse(jsonString));
}

message.joined = function(who, when) {
	when = when || new Date();
	return new Message({'type': 'joined', 'who': who, 'when': when});
};

message.left = function(who, when) {
	when = when || new Date();
	return new Message({'type': 'left', 'who': who, 'when': when});
};

message.said = function(who, what, when) {
	when = when || new Date();
	return new Message({'type': 'said', 'who': who, 'what': what, 'when': when});
}

if(typeof module === "object") {
	module.exports = message;
}
else { // running in browser
	this.Message = message;
}

})();
