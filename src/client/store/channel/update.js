import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const updateChannel = createAction();

// map to request
const channel$ = updateChannel.$
    .do(() => status('updating'))
    .map(ch => ({
        ...ch,
        team: ch.team.id,
    }))
    .map(channel => sign(channel))
    .flatMap(channel => post(`/api/channels/${channel.id}`, channel))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({channelError: res.error}) : ({channelError: undefined, updatedChannel: res})));

export default channel$;
