import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const createChannel = createAction();

// map to request
const channel$ = createChannel.$
    .do(() => status('loading'))
    .map(team => sign(team))
    .flatMap(team => post('/api/channels/new', team))
    .do(res => (res.error || !res.team ? status('error') : status('finished')))
    .map(res => ({newChannel: res}));

export default channel$;
