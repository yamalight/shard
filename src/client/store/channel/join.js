import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const joinChannel = createAction();

// map to request
const channel$ = joinChannel.$
    .do(() => status('loading'))
    .map(channel => sign(channel))
    .flatMap(channel => post(`/api/channels/${channel.id}/join`, channel))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({channelError: res.error}) : ({channelError: undefined, joinedChannel: res})));

export default channel$;
