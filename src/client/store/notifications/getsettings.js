import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getNotifySettings = createAction();

// map to request
const notifications$ = getNotifySettings.$
    // only continue if new team or force refetch
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(({channel, token}) => get(`/api/notifications/${channel}/settings`, token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (
        res.settings ?
        ({notifySettings: res.settings}) :
        ({notificationError: res.error, notifySettings: {}})
    ));

export default notifications$;
