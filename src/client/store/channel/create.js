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
    .do(res => (res.error || !res.team ? status('error') : status('finished')))
    .map(res => ({newChannel: res}));

export default channel$;
