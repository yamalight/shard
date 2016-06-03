import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getPublicChannels = createAction();

// map to request
const channels$ = getPublicChannels.$
    // only continue if new team or force refetch
    .distinctUntilChanged()
    .do(() => status('loadingPublic'))
    .map(data => sign(data))
    .flatMap(({team, token}) => get(`/api/channels/public?team=${team}`, token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(publicChannels => (
        Array.isArray(publicChannels) ? ({publicChannels}) : ({channelError: publicChannels.error, publicChannels: []})
    ));

export default channels$;
