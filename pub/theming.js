import storage from "./storage.js";

/** @type HTMLLinkElement */
const themeStyle = document.querySelector("link#theme");
/** @type HTMLSelectElement */
const themeSelector = document.querySelector("select#themeSelector");
const hasStorage = storage !== null;

function setTheme(name){
	themeStyle.href = "themes/" + name + ".css";
}

const savedTheme = hasStorage ? storage.get("savedTheme") : null;

if(savedTheme) {
	setTheme(savedTheme);
}

const themeData = await fetch("/themeList.json").then(resp=>resp.json());

themeSelector.replaceChildren(
	...Object.entries(themeData).map(function([name,val]){
		const opt = document.createElement("option");
		opt.text = name;
		opt.value = val;
		if(savedTheme && savedTheme == val)
			opt.selected = true;

		return opt;
	})
);

themeSelector.addEventListener("change", function () {
	const val = themeSelector.value; // maybe?
	setTheme(val);
	if(hasStorage)
		storage.set("savedTheme", val);
});
