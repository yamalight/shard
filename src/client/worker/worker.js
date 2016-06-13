/* global clients */
const pushWait = 300; // dispatch not more than every 300ms
let pushTimeout;
let pushCount = 0;
let pushBody = '';
let pushData = {};

// delayed push notification display
const pushLater = function() {
    pushTimeout = null;
    pushCount = 0;
    self.registration.showNotification('Shard', {body: pushBody, data: pushData});
};

// handle new push notifications
self.addEventListener('push', (event) => {
    const payload = JSON.parse(event.data ? event.data.text() : '{}');
    // if timeout set - clear and incement counter
    if (pushTimeout) {
        clearTimeout(pushTimeout);
        pushCount++;
    }
    // set body
    pushData = payload;
    pushBody = payload.message;
    if (pushCount > 0) {
        pushBody += `\n\nAnd ${pushCount} more notifications..`;
    }
    // debounce notification
    pushTimeout = setTimeout(pushLater, pushWait);
});

// handle notification click
self.addEventListener('notificationclick', (event) => {
    // Close notification.
    event.notification.close();

    // get data
    const data = event.notification.data;
    const url = `/channels/${data.team}/${data.channel}`;

    // Now wait for the promise to keep the permission alive.
    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        clients
        .matchAll({type: 'window'})
        .then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
            return false;
        })
    );
});
