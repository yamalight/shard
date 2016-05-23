import {Observable} from 'rx';
import {DOM} from 'rx-dom';

const {just} = Observable;

export const post = (url, body) =>
DOM.post({
    url,
    body: JSON.stringify(body),
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
    },
})
.map(res => {
    try {
        return JSON.parse(res.response);
    } catch (e) {
        return {};
    }
})
.catch(err => (
    err.xhr && err.xhr.response ?
    just(JSON.parse(err.xhr.response)) :
    just({error: err})
));
