var TitleNotification = TitleNotification || (function () {
	var timerId = false,
		oldTitle,
		ticInterval = 350,
		isTock = false,
		useStar = false,
		UNDERBAR = "__",
		OVERBAR = String.fromCharCode(0x203E, 0x203E),
		STAR = "*",
		UNDERSTAR = ".";

	function tic() {
		isTock = !isTock;
		var afix = isTock ? UNDERBAR : OVERBAR,
			innerAfix = useStar ? isTock ? STAR : UNDERSTAR : "";
		document.title = afix + innerAfix + " " + oldTitle + " " + innerAfix + afix;
	}

	var obj = {
		enable: function() {
			if(!!timerId) return; // already running
			oldTitle = document.title;
			timerId = setInterval(tic,ticInterval);
		},
		enableStar: function() { useStar = true; },
		disable: function() {
			if(!timerId) return; // already stopped
			clearInterval(timerId);
			document.title = oldTitle;
			timerId = false;
			useStar = false;
		},
		isEnabled: function() { return !!timerId; }
	}
	return obj;
})();
