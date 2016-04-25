import {Observable} from 'rx';
import {DOM} from 'rx-dom';

const {just} = Observable;

export default (url, body) =>
DOM.post({
    url,
    body: JSON.stringify(body),
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
    },
})
.catch(err => (
    err.xhr && err.xhr.response ?
    just(JSON.parse(err.xhr.response)) :
    just({registerError: err})
))
.do(s => console.log(s));
