import {DOM} from 'rx-dom';
import {processRequest} from './processRequest';

export const get = (url, token) => processRequest(
    DOM.get({
        url,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-access-token': token,
        },
    })
);
