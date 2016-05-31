import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const updateMessage = createAction();

// map to request
const updateMessage$ = updateMessage.$
    .do(() => status('updating'))
    .map(data => sign(data))
    .map(data => ({
        ...data,
        url: data.replyTo ?
            `/api/chat/${data.team}/${data.channel}/reply/${data.replyTo}/${data.id}` :
            `/api/chat/${data.team}/${data.channel}/${data.id}`,
    }))
    .flatMap(({message, url, token}) => post(url, {message, token}))
    .do(res => (res.error ? status('error') : status('messageUpdated')));

export default updateMessage$;
