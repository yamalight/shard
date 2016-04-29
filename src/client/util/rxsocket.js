import {Observer} from 'rx';
import {DOM} from 'rx-dom';

export const socket = (url) => {
    // create a web socket subject
    const s = DOM.fromWebSocket(
        `ws://${window.location.host}${url}`,
        null,
        Observer.create(() => {
            console.info('socket open');
        }),
        Observer.create(() => {
            console.log('socket is about to close');
        })
    );

    // subscribing creates the underlying socket and will emit a stream of incoming
    // message events
    return s;
};
