import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const sendChat = createAction();

// map to request
const sendChat$ = sendChat.$
    .do(() => status('sending'))
    .map(data => sign(data))
    .flatMap(({team, channel, message, token}) => post(`/api/chat/${team}/${channel}`, {message, token}))
    .do(res => (res.error ? status('error') : status('messageSent')));

export default sendChat$;
