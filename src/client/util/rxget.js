import {Observable} from 'rx';
import {DOM} from 'rx-dom';

const {just} = Observable;

export const get = (url, token) =>
DOM.get({
    url,
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-access-token': token,
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
