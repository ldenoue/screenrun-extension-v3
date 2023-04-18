document.addEventListener('getScreenRunVideo', function() {
  chrome.runtime.sendMessage({type:'fetch'},(res) => {
    //console.log(res)
    // somehow doesn't work, so using lastUrl to ask the background
    //console.log('received res from background',res.lastUrl,res.mouseEvents)
    //const reply = new CustomEvent("getScreenRunVideoReply", { detail: res});
    //document.dispatchEvent(reply);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetch') {
    const evt = new CustomEvent('getScreenRunVideo');
    document.dispatchEvent(evt);
  } else if (request.type === 'lastUrl') {
    const reply = new CustomEvent("getScreenRunVideoReply", { detail: request});
    document.dispatchEvent(reply);
  }
  sendResponse({})
})
