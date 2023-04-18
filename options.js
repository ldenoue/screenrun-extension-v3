function tabCapture(options) {
  const constraints = {
    audio: options.audible,
    video: true,
    videoConstraints: {
        mandatory: {
            chromeMediaSource: "tab",
            minFrameRate: 30,
            maxFrameRate: 60,
            maxWidth: options.width,
            maxHeight: options.height,
            minWidth: options.width,
            minHeight: options.height,
        }
    }
  };
  return new Promise((resolve) => {
    chrome.tabCapture.capture(
      constraints,
      (stream) => {
        resolve(stream);
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

let startTime = null;
let mediaRecorder = null;

function saveFile(url) {

}

async function stopRecord(option) {
  if (mediaRecorder)
    mediaRecorder.stop();
}

async function getAudio() {
  try {
    return await navigator.mediaDevices.getUserMedia({video: false, audio: true})
  } catch (e) {
    return null
  }
}

let stream = null
async function startRecord(options) {
  stream = await tabCapture(options);
  //const audioStream = await getAudio();
  const audioStream = null;
  if (stream) {
    if (options.audible) {
      context = new AudioContext();
      const newStream = context.createMediaStreamSource(stream);
      newStream.connect(context.destination);
    }
    // call when the stream inactive
    stream.oninactive = () => {
      window.close();
    };
    if (audioStream)
      stream.addTrack(audioStream.getAudioTracks()[0]);
    let chunks = [];
    mediaRecorder = new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,vp9,opus'});
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    }
    mediaRecorder.onstop = function(e) {
      startTime = null
      mediaRecorder = null;
      let blob = new Blob(chunks, { 'type' : 'video/webm' });
      chunks = [];
      let fr = new FileReader();
      fr.onload = (e) => {
        let url = fr.result;
        //saveFile(url)
        chrome.runtime.sendMessage({type: 'url', url });
        window.close();
      }
      fr.readAsDataURL(blob)
    };
    chunks = []
    /*await sendMessageToTab(options.currentTabId, {
      type: "FROM_OPTION",
      data: "start_microphone",
    });*/
    mediaRecorder.start(1000);
    startTime = Date.now()
  } else {
    window.close();
  }
}

let options = null
async function prepareRecord(opt) {
  options = opt
    await sendMessageToTab(options.currentTabId, {
      type: "FROM_OPTION",
      data: "start_microphone",
    });
}

// Receive data from Current Tab or Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, data } = request;

  switch (type) {
    case "START_RECORD":
      startRecord(data);
      //prepareRecord(data);
      break;
    case "STOP_RECORD":
      stopRecord(data);
      break;
    case "MIC_STREAM":
      console.log('got mic stream',data);
      //options.audioStream = data.stream
      startRecord(options)
      break;
    default:
      break;
  }

  sendResponse({});
});
