import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const markRead = createAction();

// map to request
const markRead$ = markRead.$
    .do(() => status('sending'))
    .map(data => sign(data))
    .map(data => ({
        ...data,
        url: `/api/chat/${data.team}/${data.channel}/read`,
    }))
    .flatMap(({messages, replies, url, token}) => post(url, {messages, replies, token}))
    .do(res => (res.error ? status('error') : status('marked')));

export default markRead$;
