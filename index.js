var self = require("sdk/self");

var {ToggleButton} = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var pref = require("sdk/simple-prefs").prefs;
var request = require("sdk/request");

/*
pageMod.PageMod({
	include: /.*youtube\.com.*//*,
	contentScriptFile: "./onLoad.js",
	attachTo: "top",
	onAttach: function(worker) {
			console.log("Loading information for URL: " + tabs.activeTab.url);
			worker.port.emit("loadInformation", tabs.activeTab.url);
			worker.port.on("loadedInformation", function(url, time) {
				youtubeURL = url;
				watchTime = time;
			});
	}
});
*/


// tabs.on("open", function(tab) {
// 	console.log("Open triggered for url: " + tab.url);
// 	if(tab.url.search(/.*youtube\.com.*/) === -1) {
// 		console.log("URL does NOT match regex pattern");
// 	}
// 	var worker = tab.attach({contentScriptFile: "./onLoad.js"});
// 	worker.port.emit("loadInformation", tabs.activeTab.url);
// 	worker.port.on("loadedInformation", function(url, time) {
// 		youtubeURL = url;
// 		watchTime = time;
// 	})
// });
//
// tabs.on("pageshow", function(tab) {
// 	console.log("Pageshow triggered for url: " + tab.url);
// })
//
// var cm = require("sdk/context-menu");
// cm.Item({
//     label: "dummy",
//     contentScript: 'self.on("context", function (node) {' +
//         '  self.postMessage(document.URL);' +
//         '  return false;' +
//     '});',
//     onMessage: function (pageUrl) {
//         console.log(pageUrl);
//     }
// });

//Create a button for this add-on
var button = ToggleButton({
	id: "mozilla-test",
	label: "Youtube Beam",
	icon: {
		"16": "./beam-16.png",
		"32": "./icon-32.png",
		"64": "./beam-64.png"
	},
	onChange: handleChange
});

//Make the button disabled by default - only enable for youtube pages
//button.disabled = true;

//Create the panel that appears on button press
var panel = panels.Panel({
	contentURL: "./panel.html",
	contentScriptFile: "./panel.js",
	onHide: handleHide
});

//Make the panel appear when the button is pressed
function handleChange(state) {
	if(state.checked) {
		panel.show({
			position: button
		});

		//Send the device list to the panel for loading
		panel.port.emit("show", getDeviceListString());
		//panel.resize(200, 200);
	}
}

//Gets the trimmed deviceList variable
function getDeviceListString() {
	//Get the raw deviceList variable
	var text = pref.deviceList;

	//remove whitespace and non-alphanumeric characters
	return text.replace(/\s/g,"").replace(/\W/g,"");
}

//Gets the deviceList as an array, or null if invalid
function getDeviceListArray() {
	var arr = [];
	var deviceList = getDeviceListString();
	if(deviceList.length % 6 === 0) {
		for(var i = 0; i < deviceList.length / 6; i++) {
				arr.push(deviceList.substr(i * 6, 6));
		}
		return arr;
	} else {
		console.log("Invalid device list - failed to get array of devices");
		return null;
	}
}

var pageWorker = require("sdk/page-worker");

panel.port.on("clicked-link", function(num) {
	//debug info
	//console.log("You clicked on link #" + num);
	//console.log("This is the ID: " + getDeviceListArray()[num]);

	//we send an http request to that ID
	//console.log("Trying to send some test data!");

	//Load in the URL of the youtube page we are on
	/*
	var search = "v=";
	var url = tabs.activeTab.url;

	var startIndex = url.indexOf(search);

	if(startIndex === -1) {
		console.log("On youtube, but not on a video. Returning.");
		return;
	}

	var urlLength = -1;
	if(url.indexOf("&") === -1) {
		urlLength = url.length - startIndex;
	} else {
		urlLength = url.indexOf("&") - startIndex;
	}

	url = url.substr(url.indexOf(search) + search.length, urlLength);
	console.log("Current video URL: " + url);

	//Pull out the timestamp of the video right now
	console.log("Current video time: " +
		document.getElementsByClassName("ytp-time-current")[0].innerHTML);
		*/

	//console.log("Current video URL: " + youtubeURL);
	//console.log("Current video time: " + watchTime);

	//Send the data!
	//post("Sending to " + getDeviceListArray()[num]);

	/*
	var worker = pageWorker.Page({
		contentURL: tabs.activeTab.url,
		contentScriptFile: "./onLoad.js"
	});

	worker.port.emit("loadInformation", tabs.activeTab.url);
	worker.port.on("loadedInformation", function(u, t) {
			sendData(u, t, num);
		});*/

	tabs.activeTab.attach({
		contentScriptFile: "./onLoad.js",
		onMessage: function(time) {
				sendData(trimURL(tabs.activeTab.url), time, num);
		}
	});

	panel.hide();
});

panel.port.on("resize", function({width, height}) {
	//console.log("Resizing!");
	console.log("Current size: " + panel.width + ", " + panel.height);
	console.log("Resizing to: " + width + ", " + height);
	panel.resize(width, height);
});

function handleHide() {
	button.state("window", {checked: false});
}

/*
 * Whenever a tab is loaded in, check its URL. If it's a youtube page, then
 * go ahead and enable the button.
 */
 /*
tabs.on("ready", function(tab) {
	if(tab.url.contains("youtube.com")) {
		button.state(tab, {
			"disabled": false
		});
	} else {
		button.state(tab, {
			"disabled": true
		});
	}
});
*/

function trimURL(url) {
	var search = "v=";

  var startIndex = url.indexOf(search);

  if(startIndex === -1) {
    console.log("On youtube, but not on a video. Doing nothing.");
    return;
  }

  var urlLength = -1;
  if(url.indexOf("&") === -1) {
    urlLength = url.length - startIndex;
  } else {
    urlLength = url.indexOf("&") - startIndex;
  }

  url = url.substr(url.indexOf(search) + search.length, urlLength);
  console.log("Current video URL: " + url);

	return url;
}

function sendData(url, time, num) {
	var to = getDeviceListArray()[num];
	var str = "To: " + to + " URL: " + url + " @ " + time;
	put(to, str);
}

//~~~~~Beyond this are HTTP based functions~~~~~//
var mainURL = "http://api-m2x.att.com/v2/devices/";
var APIKey = "a5b00c642f703ee1060b261b2ff303e2";
var deviceKey = "b4aa9506d20bef737ee803df8e1dd05a";

//POST a string to the given stream
function put(to, str) {
	var URL = mainURL + deviceKey + "/streams/" + to + "/value";
	var CONTENT = "{\"value\": \"" + str + "\"}";

	var http = new request.Request({
		url: URL,
		onComplete: function(response) {
			console.log("Response summary:");
			console.log("\tStatus: " + response.status + " " + response.statusText);
			console.log("\tText: " + response.text);
		},
		headers: {
			"Content-Type": "application/json",
			"X-M2X-KEY": APIKey
		},
		content: CONTENT
	});

	http.put();
}
