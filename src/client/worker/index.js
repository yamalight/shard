import {registerNotifications} from '../store';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/worker/worker.js')
    .then(registration => {
        return registration.pushManager
            .getSubscription()
            .then(subscription => {
                if (subscription) {
                    return subscription;
                }

                return registration.pushManager.subscribe({userVisibleOnly: true});
            });
    })
    .then(subscription => {
        const endpoint = subscription.endpoint;
        const rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
        const key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
        const rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
        const authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
        registerNotifications({endpoint, key, authSecret});
    })
    .catch(err => console.error('worker error', err));
}
