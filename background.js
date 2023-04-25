let studioTabId = null

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'id')
  {
    studioTabId = sender.tab.id
  }   
  else if (request.type === 'click' || request.type === 'move') {
    if (studioTabId)
      chrome.tabs.sendMessage(studioTabId, request)
  }
  sendResponse();
  return true
});

function welcomePage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("welcome.html"),
    active: true
  })
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason.search(/install/g) === -1) {
      return
  } else {
    welcomePage()
  }
})

chrome.action.onClicked.addListener(function(tab) {
  welcomePage()
});
