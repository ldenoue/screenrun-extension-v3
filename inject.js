(function () {
    let w = window.innerWidth
    let h = window.innerHeight
    window.onresize = () => {
        w = window.innerWidth
        h = window.innerHeight
    }
    document.onclick = (evt) => {
      try {
        chrome.runtime.sendMessage({type:'click', x: evt.clientX * 100 / w, y: evt.clientY * 100 / h });
      } catch (e) {}
    }
    document.onmousemove = (evt) => {
      try {
        chrome.runtime.sendMessage({type:'move',x: evt.clientX * 100 / w, y: evt.clientY * 100 / h });
      } catch (e) {}
    }
  })();
  