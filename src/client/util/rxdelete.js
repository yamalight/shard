import {DOM} from 'rx-dom';
import {processRequest} from './processRequest';

export const del = (url, body) => processRequest(
    DOM.ajax({
        url,
        body: JSON.stringify(body),
        method: 'DELETE',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        },
    })
);
