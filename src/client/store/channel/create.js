import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const createChannel = createAction();

// map to request
const channel$ = createChannel.$
    .do(() => status('loading'))
    .map(channel => sign(channel))
    .flatMap(channel => post('/api/channels/new', channel))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({channelError: res.error}) : ({channelError: undefined, newChannel: res})));

export default channel$;
