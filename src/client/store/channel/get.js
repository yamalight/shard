import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getChannels = createAction();

// map to request
const channels$ = getChannels.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(({team, token}) => get(`/api/channels?team=${team}`, token))
    .do(res => (res.error || !res.channels ? status('error') : status('finished')))
    .map(channels => ({channels}));

export default channels$;
