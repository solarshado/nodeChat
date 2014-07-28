var TitleNotification = TitleNotification || (function () {
	var timerId,
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
			oldTitle = document.title;
			timerId = setInterval(tic,ticInterval);
		},
		disable: function() {
			clearInterval(timerId);
			document.title= oldTitle;
		}
	}
	return obj;
})();
