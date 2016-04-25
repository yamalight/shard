import {createAction} from 'rxstate';
import status from './status';
import post from '../../util/rxpost';

// create action
export const loginUser = createAction();

// map to request
const login$ = loginUser.$
    .do(() => status('loggingin'))
    .flatMap(user => post('/api/login', user))
    .do(res => (res.authError ? status('error') : status('loggedin')));

export default login$;
