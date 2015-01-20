$(document).ready(function() {
	var themeStyle = $("link#theme"),
		themeSelector = $("select#themeSelector"),
		themeLibrary = {},
		storage = window.storage,
		hasStorage = storage !== null;

	if(hasStorage) {
		var val = storage.get("savedTheme");
		if(val)
			setTheme(val);
	}

	$.get("/themeList.json", function(data){
		var savedTheme = hasStorage ? storage.get("savedTheme") : null;
		themeLibrary = data;
		themeSelector.children().remove();

		Object.keys(data).forEach(function(name){
			var val = data[name],
				 opt = $("<option>")
					.text(name)
					.val(val);
			if(savedTheme && savedTheme == val)
				opt.attr("selected", true);

			themeSelector.append(opt);
		});	
	});

	themeSelector.change(function () {
		var val = themeSelector.val();
		setTheme(val);
		if(hasStorage)
			storage.set("savedTheme", val);
	});

	function setTheme(name){
		themeStyle.attr("href","themes/" + name + ".css")
	}
});
