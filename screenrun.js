chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'click' || request.type === 'move') {
    window.postMessage(request, '*')
  }
  sendResponse({})
})

let href = window.location.href
let studioLinks = ['http://localhost:8080/studio','https://screenrun.app/studio']
if (studioLinks.indexOf(href) !== -1)
  chrome.runtime.sendMessage({type:'id'});