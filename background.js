let debug = false
let screenRunStudioLink = debug ? 'http://localhost:8080/studio' : 'https://screenrun.app/studio'

let lastUrl = null;
let mouseEvents = [];
let startTime = null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'fetch') {
    sendResponse({})
    sendMessageToTab(sender.tab.id,{type:'lastUrl',lastUrl,mouseEvents})
  } else  if (request.type === 'url') {
    lastUrl = request.url
    downloadScreenDrop(request.url)
    openOrActivateScreenRun()
    sendResponse({});
  }
  else if (recording) {
    let event = request
    event.ts = Date.now() - startTime
    mouseEvents.push(event)
    sendResponse({});
  } else {
    sendResponse({});
  }
});

function openOrActivateScreenRun() {

  chrome.tabs.query({url:screenRunStudioLink}, (t) => {
    if (t && t.length > 0) {
      let tabId = t[0].id
      chrome.tabs.update(tabId, { highlighted: true});
      setTimeout(() => sendMessageToTab(tabId,{type:'fetch'}), 2000);
      
    } else {
      chrome.tabs.create({
        active: true,
        url: screenRunStudioLink
      }, function(tab) {
        //console.log('opened new studio tab')
        //setTimeout(() => sendMessageToTab(tab.id,{type:'fetch'}), 2000);
      })
    }
  })
}

function downloadScreenDrop(url) {
  let filename = 'screenrun.webm';
  chrome.downloads.download({
    url: url,
    filename: filename,
    conflictAction: 'overwrite'
  }, (downloadId) => {
  });
}

/*function downloadScreenDrop(url) {
  chrome.storage.local.get('keepLastOnly',(res) => {
    let filename = '';
    if (res.keepLastOnly)
      filename = 'screenrun.webm';
    else
      filename = 'screenrun-' + Date.now() + '.webm';
    chrome.downloads.download({
      url: url,
      filename: filename,
      conflictAction: res.keepLastOnly?'overwrite':'uniquify',
    }, (downloadId) => {
      //chrome.storage.local.set({downloadId});
    });
  });
}*/


function openOptions() {
  return new Promise(async (resolve) => {
    chrome.tabs.create(
      {
        pinned: true,
        active: false, // <--- Important
        url: `chrome-extension://${chrome.runtime.id}/options.html`,
      },
      (tab) => {
        resolve(tab);
      }
    );
  });
}

async function removeTab(tabId) {
  /*return new Promise((resolve) => {
    chrome.tabs.remove(tabId).then(resolve).catch(resolve);
  });*/
  try {
    await sendMessageToTab(tabId, {
      type: "STOP_RECORD",
    });
  } catch (e) {
    console.log('removeTab issue',e)
  }
}

function executeScript(tabId, file) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: [file],
      },
      () => {
        resolve();
      }
    );
  });
}

function sendMessageToTab(tabId, data) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, data, (res) => {
      resolve(res);
    });
  });
}

function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        resolve(value);
      }
    );
  });
}

let recording = false

chrome.action.onClicked.addListener(async (currentTab) => {
  let width = currentTab.width
  let height = currentTab.height
  const optionTabId = await getStorage("optionTabId");
  if (recording || optionTabId) {
    let closeAfter = recording
    recording = false;
    startTime = null;
    await removeTab(optionTabId);
    if (closeAfter)
      return
  }

  await setStorage("currentTabId", currentTab.id);

  //await executeScript(currentTab.id, "content.js");

  await sleep(500);

  // Open the option tab
  const optionTab = await openOptions();

  await setStorage("optionTabId", optionTab.id);

  await sleep(500);

  mouseEvents= [];
  startTime = Date.now();
  recording = true;
  await sendMessageToTab(optionTab.id, {
    type: "START_RECORD",
    data: { currentTabId: currentTab.id, audible: currentTab.audible, width: width, height: height },
  });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const currentTabId = await getStorage("currentTabId");
  const optionTabId = await getStorage("optionTabId");

  // When the current tab is closed, the option tab is also closed by the way
  if (currentTabId === tabId && optionTabId) {
    try {
      await removeTab(optionTabId);
    } catch (e) {
      console.log('err removing tab')
    }
  }
});
