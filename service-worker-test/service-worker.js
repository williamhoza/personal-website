self.addEventListener('message', event => {
  showNotification(0);
});

self.addEventListener('notificationclick', event => {
  if (event.action == "inc") showNotification(event.notification.data + 1);
});

function showNotification(n) {
  this.registration.showNotification("Test", {
    body: n,
    data: n,
    actions: [
      {
        action: "inc",
        title: "Increment"
      }
    ],
    tag: "test"
  });
}
