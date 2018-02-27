var woo = {};
woo.load = function(){
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: "main.html" });
  });
}
woo.load();