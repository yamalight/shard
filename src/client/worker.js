const pushWait = 500; // dispatch not more than every 300ms
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

// skip waiting on install
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
// claim all clients on activation
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// handle new push notifications
self.addEventListener('push', (event) => {
    const payload = event.data ? event.data.json() : {};
    // if timeout set - clear and incement counter
    if (pushTimeout) {
        clearTimeout(pushTimeout);
        pushCount++;
    }
    // set body
    pushData = payload;
    pushBody = payload.message || 'No notification message :(';
    if (pushCount > 0) {
        pushBody += `\n\nAnd ${pushCount} more notifications..`;
    }
    // check if clients are visible
    event.waitUntil(
        self.clients.matchAll()
        .then(clientList => {
            const reurl = new RegExp(`/channels/${payload.team}/${payload.channel}$`, 'i');
            const sameChannel = clientList.some(client => client.focused && reurl.test(client.url));
            // if no focused windows with same URL found
            if (!sameChannel) {
                // debounce notification
                pushTimeout = setTimeout(pushLater, pushWait);
            }
        })
    );
});

// handle notification click
self.addEventListener('notificationclick', (event) => {
    // Close notification.
    event.notification.close();

    // get data
    const data = event.notification.data;
    let url = '/channels/';
    if (data && data.team && data.channel) {
        url = `/channels/${data.team}/${data.channel}`;
    }
    const reurl = new RegExp(`${url}`, 'i');

    // Now wait for the promise to keep the permission alive.
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        self.clients
        .matchAll()
        .then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (reurl.test(client.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
            return false;
        })
    );
});
