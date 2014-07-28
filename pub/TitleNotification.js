var TitleNotification = TitleNotification || (function () {
	var timerId = false,
	    oldTitle,
	    ticInterval = 350,
	    isTock = false,
	    UNDERBAR = "__",
	    OVERBAR = String.fromCharCode(0x203E, 0x203E);

	function tic() {
		isTock = !isTock;
		var afix = isTock ? UNDERBAR : OVERBAR;
		document.title = afix + " " + oldTitle + " " + afix;
	}

	var obj = {
		enable: function() {
			if(!!timerId) return; // already running
			oldTitle = document.title;
			timerId = setInterval(tic,ticInterval);
		},
		disable: function() {
			if(!timerId) return; // already stopped
			clearInterval(timerId);
			document.title = oldTitle;
			timerId = false;
		}
	}
	return obj;
})();
