import {createAction} from 'rxstate';
import status from './status';
import {del, sign} from '../../util';

// create action
export const deleteChannel = createAction();

// map to request
const channel$ = deleteChannel.$
    .do(() => status('updating'))
    .map(channel => sign(channel))
    .flatMap(channel => del(`/api/channels/${channel.id}`, channel))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({channelError: res.error}) : ({channelError: undefined, updatedChannel: {}})));

export default channel$;
