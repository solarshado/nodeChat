var storage = (function() {
	var isSupported = false;

	try {
		isSupported = 'localStorage' in window &&
			      window['localStorage'] !== null;
	} catch (e) { /* no-op*/ } 

	if(!isSupported) return null;
	
	var impl = window.localStorage;

	function setValue(key,value){
		if(value === undefined)
			impl.removeItem(key);
		else
			impl[String(key)] = value;
	}

	function getValue(key,parser){
		var val = impl[key];
		return (typeof(parser) === "function") ?
			parser(val) :
			val;
	}

	return {
		get: getValue,
		set: setValue,
	};
})()
