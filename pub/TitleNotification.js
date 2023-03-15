const UNDERBAR = "__";
const OVERBAR = String.fromCharCode(0x203E, 0x203E);
const STAR = "*";
const UNDERSTAR = ".";

const ticInterval = 350;

/** @type ReturnType<typeof setInterval> */
let timerId = undefined;
let oldTitle;
let isTock = false;
let useStar = false;

function tic() {
	isTock = !isTock;
	let afix = isTock ? UNDERBAR : OVERBAR;
	let innerAfix = useStar ? (isTock ? STAR : UNDERSTAR) : "";
	document.title = afix + innerAfix + " " + oldTitle + " " + innerAfix + afix;
}

const TitleNotification = {
	enable() {
		if(!!timerId) return; // already running
		oldTitle = document.title;
		timerId = setInterval(tic,ticInterval);
	},
	enableStar() { useStar = true; },
	disable() {
		if(!timerId) return; // already stopped
		clearInterval(timerId);
		document.title = oldTitle;
		timerId = undefined;
		useStar = false;
	},
	isEnabled() { return !!timerId; }
}

export { TitleNotification as default, TitleNotification };
