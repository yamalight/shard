import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getHistory = createAction();

// map to socket
const history$ = getHistory.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(({team, channel, token}) => get(`/api/chat/${team}/${channel}`, token))
    .do(res => (res.error || !res.history ? status('error') : status('finished')))
    .map(res => {
        res.chatError = res.error; // eslint-disable-line
        return res;
    })
    .map(res => ({
        ...res,
        history: res.history
            .map(({replies, ...h}) => ({
                ...h,
                replies: replies.map(r => ({...r, moreMessages: []})),
                moreMessages: [],
            })),
    }));

export default history$;
