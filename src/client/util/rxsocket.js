import {Observer, Subject} from 'rx';
import {DOM} from 'rx-dom';

const noop = () => {};

// create a web socket subject
const createSocket = ({url, open, close}) => DOM.fromWebSocket(
    `ws://${window.location.host}${url}`,
    null,
    open,
    close,
);

export const socket = (url) => {
    const s = new Subject();

    const open = Observer.create(() => {
        console.info('socket open');
    });
    const close = Observer.create(() => {
        console.log('socket is about to close..');
    });

    // init socket and pipe result to subject
    const sock = createSocket({url, open, close}).subscribe(s);

    // cleanup when done
    const cleanup = (e) => {
        console.log('socket cleanup:', e);
        sock.onCompleted();
    };
    s.subscribe(noop, cleanup, cleanup);

    // subscribing creates the underlying socket and will emit a stream of incoming
    // message events
    return s;
};
