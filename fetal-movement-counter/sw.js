self.addEventListener('message', () => {
  console.log("Hello");
  showNotification("", []);
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

function saveData(data) {
  return new Promise(async (resolve, reject) => {
    let db = await getDB();
    let transaction = db.transaction("fetal-movements", "readwrite");
    
    let res = resolve;
    transaction.oncomplete = function() {
      showNotification("Saved! ", []);
      res();
    }
    transaction.onerror = function() {
      this.registration.showNotification("Fetal Movement Counter", {
        body: "Error! Data not saved. " + transaction.error + " Yikes...",
        icon: "pregnancy.png",
        badge: "pregnancy.png"
      });
      res();
    }
    transaction.onabort = function() {
      this.registration.showNotification("Fetal Movement Counter", {
        body: "Error! Data not saved. Transaction aborted. Yikes...",
        icon: "pregnancy.png",
        badge: "pregnancy.png"
      });
      res();
    }
    
    let eventsStore = transaction.objectStore("fetal-movements");
    for (let i = 0; i < data.length; i++) {
      eventsStore.add({timestamp: data[i]});
    }
    transaction.commit();
  });
}

self.addEventListener("notificationclose", (event) => {
  if (event.notification.data && "length" in event.notification.data && event.notification.data.length > 0) {
    event.waitUntil(saveData(event.notification.data));
  }
});

self.addEventListener("notificationclick", (event) => {
  if (event.action == "rec") {
    // Add timestamp to notification data without modifying database
    unsavedData = event.notification.data;
    unsavedData.push(new Date());
    showNotification("", unsavedData);
  } else if (event.action == "save") {
    // Save unsaved data to database
    event.waitUntil(saveData(event.notification.data));
  }
});

function showNotification(msg, unsavedData) {
  this.registration.showNotification("Fetal Movement Counter", {
    body: msg + unsavedData.length + " unsaved fetal movements.",
    actions: [
      {
        action: "rec",
        title: "Log Movement"
      }, {
        action: "save",
        title: "Save"
      }
    ],
    tag: "singleton",
    icon: "pregnancy.png",
    badge: "pregnancy.png",
    data: unsavedData
  });
}
