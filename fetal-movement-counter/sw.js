console.log("Service worker created [3]");
self.addEventListener('message', () => {
  showNotification(true, null);
});

let dbGetter;

// Based on https://github.com/jakearchibald/svgomg/blob/main/src/js/utils/storage.js#L5
function getDB() {
  if (dbGetter) return dbGetter;
  
  dbGetter = new Promise((resolve, reject) => {
    const req = indexedDB.open("fetal-movement-counter-db");
    
    req.onerror = () => {
      reject(req.error);
    };
    
    req.onsuccess = () => {
      resolve(req.result);
    };
  });
  
  return dbGetter;
}

self.addEventListener('notificationclick', (event) => {
  if (event.action == 'rec') {
    showNotification(false, null);
    getDB().then(db => {
      let transaction = db.transaction("fetal-movements", "readwrite");
      let eventsStore = transaction.objectStore("fetal-movements");
      
      let newEvent = { timestamp: new Date() };
      let req = eventsStore.add(newEvent);
      req.onsuccess = function() {
        showNotification(true, req.result);
      }
    });
  }
});

function showNotification(ready, total) {
  let nBody, nActions;
  if (ready) {
    nBody = "Ready!" + (total == null ? "" : " Total movements logged: " + total);
    nActions = [
      {
        action: "rec",
        title: "Log Movement"
      }
    ];
  } else {
    nBody = "Working...";
    nActions = [];
  }
  
  this.registration.showNotification("Fetal Movement Counter", {
    body: nBody,
    actions: nActions,
    tag: "singleton",
    icon: "pregnancy.png",
    badge: "pregnancy.png"
  });
}