import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';
import {resetChannels} from './resetChannels';
import {resetHistory} from '../chat/resetHistory';

// create action
export const getChannels = createAction();

// map to request
const channels$ = getChannels.$
    .distinctUntilChanged()
    .do(() => status('loading'))
    .do(() => resetChannels())
    .do(() => resetHistory())
    .map(data => sign(data))
    .flatMap(({team, token}) => get(`/api/channels?team=${team}`, token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(channels => (Array.isArray(channels) ? ({channels}) : ({channelError: channels.error, channels: []})));

export default channels$;
