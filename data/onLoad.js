var time = "";

var elements = document.getElementsByClassName("ytp-time-current");
if(elements.length > 0) {
  time = elements[0].innerHTML;
} else {
  time = "unknown";
}

console.log("Current video time: " + time);

self.postMessage(time);
