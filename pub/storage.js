const isSupported = (function() {
	try {
		return 'localStorage' in window &&
			window['localStorage'] !== null;
	}
	catch (e) {
		return false;
	}
})();

const impl = window.localStorage;

function setValue(key,value){
	if(value === undefined)
		impl.removeItem(key);
	else
		impl[String(key)] = value;
}

function getValue(key,parser){
	const val = impl[key];
	return (typeof(parser) === "function") ?
		parser(val) :
		val;
}

export default ( isSupported ? {
	get: getValue,
	set: setValue,
} : null );
