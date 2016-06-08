import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const startDM = createAction();

// map to request
const user$ = startDM.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap((data) => post('/api/user/conversation', data))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ?
        ({userError: res.error}) :
        ({userError: undefined, createdDM: res.conversation}))
    );

export default user$;
