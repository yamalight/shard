import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getHistory = createAction();

// map to socket
const history$ = getHistory.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .map(({team, channel, token, timestamp}) => ({
        token,
        url: timestamp ?
            `/api/chat/${team}/${channel}?startFrom=${timestamp}` :
            `/api/chat/${team}/${channel}`,
    }))
    .flatMap(({url, token}) => get(url, token))
    .do(res => (res.error || !res.history ? status('error') : status('finished')))
    .map(res => {
        res.chatError = res.error; // eslint-disable-line
        return res;
    });

export default history$;
