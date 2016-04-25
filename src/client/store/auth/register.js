import {createAction} from 'rxstate';
import status from './status';
import post from '../../util/rxpost';

// create action
export const registerUser = createAction();

// map to request
const register$ = registerUser.$
    .do(() => status('registering'))
    .flatMap(user => post('/api/register', user))
    .do(res => (res.registerError ? status('error') : status('registered')));

export default register$;
