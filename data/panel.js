/*
 * @param text: The "deviceList" preference
 */
self.port.on("show", function (deviceList) {
 	//Load in the list dynamically here

//	document.getElementById("content").addEventListener("click", function() {
//		self.port.emit("hide");
//	});


	var content = "";

	if(deviceList.length % 6 !== 0) {
		content = "<b>Failed to read devices- check settings</b>";
	} else {
		for(var i = 0; i < deviceList.length / 6; i++) {
				//arr.push(deviceList.substr(i * 6, 6));
				content = content + "<a href=#" + i + " class='link'>[Test] ID = " +
					deviceList.substr(i * 6, 6) + "</a>\n<hr>\n";
		}
	}


	//document.getElementById("content").innerHTML =
	//	"<a href='#1'>[Test] George's Android Phone</a>" +
	//	"<hr>";
	document.getElementById("content").innerHTML = content;

	//Makes the panel close when a link is clicked on - forward the event to main
	var links = document.getElementsByClassName("link");
	for(var j = 0; j < links.length; j++) {
			links[j].addEventListener("click", clickListener(j));
	}
	//document.getElementById("link").addEventListener("click", function() {
	//	self.port.emit("clicked-link");
	//})

	//console.log("panel width: " + document.getElementById("content").clientWidth);
	//console.log("panel height: " + document.getElementById("content").clientHeight);

	//self.port.emit("resize",
	//	"{width: document.getElementById('content').clientWidth, " +
	//	"height: document.getElementById('content').clientHeight}");
});

/*
 * This is an interesting case with closures. You have to return a function,
 * because if you don't, then every link will be assigned the value
 * (numLinks) + 1. This is a problem with JS not having block scope variables,
 * but instead only function scope variables. Wrapping this in a function and
 * returning that the value gets passed properly.
 */
function clickListener(num) {
	return function() {
		self.port.emit("clicked-link", num);
		//self.port.emit("send");
	};
}
