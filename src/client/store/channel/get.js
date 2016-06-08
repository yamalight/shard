import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';
import {resetChannels} from './resetChannels';
import {resetHistory} from '../chat/resetHistory';

// create action
export const getChannels = createAction();

// map to request
const channels$ = getChannels.$
    // only continue if new team or force refetch
    .distinctUntilChanged(d => d, (a, b) => a.team === b.team && !b.refetch)
    .do(() => status('loading'))
    .do(({refetch}) => !refetch && resetChannels())
    .do(({refetch}) => !refetch && resetHistory())
    .map(data => sign(data))
    .map(data => ({
        ...data,
        url: data.type ?
            `/api/channels?team=${data.team}&type=${data.type}` :
            `/api/channels?team=${data.team}`,
    }))
    .flatMap(({url, token}) => get(url, token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(channels => (Array.isArray(channels) ? ({channels}) : ({channelError: channels.error, channels: []})));

export default channels$;
