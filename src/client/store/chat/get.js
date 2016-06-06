import {createAction} from 'rxstate';
import status from './status';
import {chatSockets} from './connect';

// create action
export const getChat = createAction();

// map to socket
const chat$ = getChat.$
    .flatMap(({team, channel}) => chatSockets[team + channel]
        .map(e => JSON.parse(e.data))
        .map(messages => ({messages}))
    )
    .do(res => ((res.error || !res.messsages) && status('error')));

export default chat$;
