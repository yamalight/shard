const pushWait = 300; // dispatch not more than every 300ms
let pushTimeout;
let pushCount = 0;
let pushBody = '';

// delayed push
const pushLater = function(event) {
    pushTimeout = null;
    pushCount = 0;
    event.waitUntil(self.registration.showNotification('Shard', {body: pushBody}));
};

self.addEventListener('push', (event) => {
    const payload = event.data ? event.data.text() : 'no payload';
    // if timeout set - clear and incement counter
    if (pushTimeout) {
        clearTimeout(pushTimeout);
        pushCount++;
    }
    // set body
    pushBody = payload;
    if (pushCount > 0) {
        pushBody += `\n\nAnd ${pushCount} more notifications..`;
    }
    // debounce notification
    pushTimeout = setTimeout(() => pushLater(event), pushWait);
});
