import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';
import {resetReply} from './resetReply';
import {resetForward} from './resetForward';

// create action
export const sendChat = createAction();

// map to request
const sendChat$ = sendChat.$
    .do(() => status('sending'))
    .map(data => sign(data))
    .map(data => ({
        ...data,
        url: data.replyTo ?
            `/api/chat/${data.team}/${data.channel}/reply/${data.replyTo}` :
            `/api/chat/${data.team}/${data.channel}`,
    }))
    .flatMap(({message, url, token}) => post(url, {message, token}))
    .do(() => resetReply())
    .do(() => resetForward())
    .do(res => (res.error ? status('error') : status('messageSent')));

export default sendChat$;
