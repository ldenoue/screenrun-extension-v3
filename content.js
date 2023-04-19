(function () {
  let w = window.innerWidth
  let h = window.innerHeight
  window.onresize = () => {
    w = window.innerWidth
    h = window.innerHeight
  }
  document.addEventListener('mousedown', (evt) => {
    try {
      chrome.runtime.sendMessage({type:'click', x: evt.clientX, y: evt.clientY, w, h });
    } catch (e) {}
  }, true)
  /*document.addEventListener('mousemove', (evt) => {
    try {
      chrome.runtime.sendMessage({type:'move', x: evt.clientX, y: evt.clientY, w, h });
    } catch (e) {}
  }, true)*/
})();