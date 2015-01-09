/// just throwing this in here so I don't loose it

function isAtBottom(jQselector) {
		var box = $(jQselector),
			pad = parseInt(box.css("padding-top")) + parseInt(box.css("padding-bottom")),
			height = box.height(),
			totalHeight = height + pad,
			scrollHeight = box.prop("scrollHeight"),
			scrollTop = box.prop("scrollTop");
	  return ((totalHeight + scrollTop) - scrollHeight) == 0;
}
