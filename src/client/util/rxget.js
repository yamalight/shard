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
.map(res => JSON.parse(res.response))
.catch(err => (
    err.xhr && err.xhr.response ?
    just(JSON.parse(err.xhr.response)) :
    just({registerError: err})
));
