var self = require("sdk/self");

var {ToggleButton} = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var pref = require("sdk/simple-prefs").prefs;
var request = require("sdk/request");

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

/*
 * Make the button disabled by default - only enable for youtube pages
 */
button.disabled = true;

/*
 * Whenever a tab is loaded in, check its URL. If it's a youtube page, then
 * go ahead and enable the button.
 */
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

/*
 * Create the panel that appears on button press
 */
var panel = panels.Panel({
	contentURL: "./panel.html",
	contentScriptFile: "./panel.js",
	onHide: handleHide
});

/*
 * Make the panel appear when the button is pressed
 */
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

/*
 * Called when the panel is hidden- this makes sure the
 * button state is correctly set
 */
function handleHide() {
	button.state("window", {checked: false});
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

/*
 * Activated when the user clicks on a device to beam to
 */
panel.port.on("clicked-link", function(num) {
	tabs.activeTab.attach({
		contentScriptFile: "./onLoad.js",
		onMessage: function(time) {
				sendData(trimURL(tabs.activeTab.url), time, num);
		}
	});

	panel.hide();
});

//Unused - resizes the panel to fit (but doesn't work yet)
panel.port.on("resize", function({width, height}) {
	//console.log("Resizing!");
	console.log("Current size: " + panel.width + ", " + panel.height);
	console.log("Resizing to: " + width + ", " + height);
	panel.resize(width, height);
});

/*
 * Extracts useful information from a youtube URL - specifically,
 * the "watch" id. Will also later extract the playlist info.
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

/*
 * Small helper method that sends data to the server.
 * @param url: The "watch" url, as from the trimURL() method
 * @param time: The current video time, as from the "onLoad" script
 * @param num: The 0-based number of the link clicked on in the panel. Used
 *		for figuring out the ID of the device to send to
 */
function sendData(url, time, num) {
	var to = getDeviceListArray()[num];
	var str = "To: " + to + " URL: " + url + " @ " + time;
	put(to, str);
}

//~~~~~Beyond this are HTTP based functions~~~~~//
var mainURL = "http://api-m2x.att.com/v2/devices/"; //Base server url
var APIKey = "a5b00c642f703ee1060b261b2ff303e2";    //API key
var deviceKey = "b4aa9506d20bef737ee803df8e1dd05a"; //Specific to AT&T M2X API

/*
 * PUT a string to the given stream
 * @param to: The stream ID (same as device you want to send to's ID)
 * @param str: The string to send
 */
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
