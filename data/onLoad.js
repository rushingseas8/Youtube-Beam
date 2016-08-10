/*
self.port.on("loadInformation", function(url) {
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

	//Pull out the timestamp of the video right now
  var time = "";

  var elements = document.getElementsByClassName("ytp-time-current");
  if(elements.length > 0) {
    time = elements[0].innerHTML;
  } else {
    time = "unknown";
  }

  console.log("Current video time: " + time);

  document.querySelector("body").getElementsByClassName("ytp-time-current");
  if(elements.length > 0) {
    console.log(elements[0].innerHTML);
  } else {
    console.log("unknown");
  }

  self.port.emit("loadedInformation", url, time);
});
*/

var time = "";

var elements = document.getElementsByClassName("ytp-time-current");
if(elements.length > 0) {
  time = elements[0].innerHTML;
} else {
  time = "unknown";
}

console.log("Current video time: " + time);

self.postMessage(time);
