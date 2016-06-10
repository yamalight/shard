import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const updateNotifySettings = createAction();

// map to request
const notifications$ = updateNotifySettings.$
    // only continue if new team or force refetch
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(data => post(`/api/notifications/${data.channel}/settings`, data))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (
        res.error ?
        ({notificationError: res.error, updatedSettings: false}) :
        ({notificationError: undefined, updatedSettings: true})
    ));

export default notifications$;
