window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']]
  }, startup: {
    ready: () => {
      console.log(document.querySelector('mjx-container'));
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(() => {
        document.querySelectorAll('mjx-container').forEach(function(mjx) {
          if (mjx.nextSibling != null && mjx.nextSibling.nodeType == Node.TEXT_NODE) {
            let prefix = mjx.nextSibling.nodeValue.split(/\s/)[0];
            
            if (prefix != "") {
              mjx.nextSibling.nodeValue = mjx.nextSibling.nodeValue.substr(prefix.length);
              
              let sp = document.createElement("span");
              mjx.parentNode.insertBefore(sp, mjx);
              sp.appendChild(mjx);
              sp.appendChild(document.createTextNode(prefix));
              sp.style.whiteSpace = "nowrap";
            }
          }
        });
      });
    }
  }
};
