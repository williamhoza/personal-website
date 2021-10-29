console.log("Service worker created [3]");
self.addEventListener('message', () => {
  showNotification(null);
});

let dbReq = indexedDB.open("fetal-movement-counter-db");
let db = null;

dbReq.onsuccess = function() {
  db = dbReq.result;
}

self.addEventListener('notificationclick', (event) => {
  if (event.action == 'rec') {
    let transaction = db.transaction("fetal-movements", "readwrite");
    let eventsStore = transaction.objectStore("fetal-movements");
    
    let newEvent = { timestamp: new Date() };
    let req = eventsStore.add(newEvent);
    req.onsuccess = function() {
      showNotification(req.result);
    }
  }
});

function showNotification(total) {
  
  this.registration.showNotification("Fetal Movement Counter", {
    body: "Ready!" + (total == null ? "" : " Total movements logged: " + total),
    actions: [
      {
        action: "rec",
        title: "Log Movement"
      }
    ],
    tag: "singleton",
    icon: "pregnancy.png",
    badge: "pregnancy.png"
  });
}
