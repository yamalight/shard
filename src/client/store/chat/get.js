import _ from 'lodash';
import {createAction} from 'rxstate';
import status from './status';
import {chatSockets} from './connect';

// create action
export const getChat = createAction();

// map to socket
const chat$ = getChat.$
    .do(() => status('connecting'))
    .flatMap(({team, channel}) => chatSockets[team + channel]
        .map(e => JSON.parse(e.data))
        .startWith([])
        .scan((acc, msg) => acc.concat([msg]))
        .map(messages => _.flattenDeep(messages))
        .map(messages => messages.map(m => ({...m, moreMessages: []})))
        .map(messages => ({messages}))
    )
    .do(res => (res.error || !res.messsages ? status('error') : status('connected')));

export default chat$;
