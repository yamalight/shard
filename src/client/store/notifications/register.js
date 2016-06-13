import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const registerNotifications = createAction();

// map to request
const notifications$ = registerNotifications.$
    // only continue if all params are present
    .do(() => status('loading'))
    .map(data => sign(data))
    .filter(({endpoint, key, authSecret, token}) => endpoint && key && authSecret && token)
    .flatMap(data => post('/api/notifications/register', data))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({notificationError: res.error}) : res));

export default notifications$;
