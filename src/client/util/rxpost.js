import {DOM} from 'rx-dom';
import {processRequest} from './processRequest';

export const post = (url, body) => processRequest(
    DOM.post({
        url,
        body: JSON.stringify(body),
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        },
    })
);
