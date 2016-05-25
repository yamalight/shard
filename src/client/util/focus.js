import {Observable} from 'rx';

export const focus = Observable.merge(
    Observable.fromEvent(document, 'visibilitychange').map(() => ({active: !document.hidden})),
    Observable.fromEvent(window, 'focus').map(() => ({active: true})),
    Observable.fromEvent(window, 'blur').map(() => ({active: false})),
);
