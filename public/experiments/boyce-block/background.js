chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("The color is green.");
	});
	
	chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.tabs.executeScript(tab.id, {file: "main.js"})
	});
	
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostEquals: 'developer.chrome.com'},
				})
			],
            actions: [
				new chrome.declarativeContent.ShowPageAction()
			]
      }]);
    });
});