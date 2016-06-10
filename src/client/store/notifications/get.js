import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getNotifications = createAction();

// map to request
const notifications$ = getNotifications.$
    // only continue if new team or force refetch
    .do(() => status('loading'))
    .map(() => sign({}))
    .flatMap(({token}) => get('/api/notifications', token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (Array.isArray(res.notifications) ? res : ({notificationError: res.error, notifications: []})));

export default notifications$;
