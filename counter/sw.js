console.log("Service worker created [3]");
self.addEventListener('message', () => {
  showNotification(null);
});

let dbReq = indexedDB.open("counter-db");
let db = null;

dbReq.onsuccess = function() {
  db = dbReq.result;
}

self.addEventListener('notificationclick', (event) => {
  if (event.action == 'rec') {
    let transaction = db.transaction("events", "readwrite");
    let eventsStore = transaction.objectStore("events");
    
    let newEvent = { timestamp: new Date() };
    let req = eventsStore.add(newEvent);
    req.onsuccess = function() {
      showNotification(req.result);
    }
  }
});

function showNotification(total) {
  
  this.registration.showNotification("Counter", {
    body: "Ready to log." + (total == null ? "" : " Total events logged: " + total),
    actions: [
      {
        action: "rec",
        title: "Log Event"
      }
    ],
    tag: "singleton"
  });
}
