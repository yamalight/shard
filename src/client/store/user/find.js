import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const findUser = createAction();

// map to request
const user$ = findUser.$
    .distinctUntilChanged()
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(data => post('/api/user/search', data))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (!res.error && res.users ? res : ({userError: res.error, users: []})));

export default user$;
