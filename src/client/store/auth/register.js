import jwtDecode from 'jwt-decode';
import {createAction} from 'rxstate';
import status from './status';
import {post} from '../../util';

// create action
export const registerUser = createAction();

// map to request
const register$ = registerUser.$
    .do(() => status('registering'))
    .flatMap(user => post('/api/register', user))
    .do(res => (res.error ? status('error') : status('registered')))
    .map(res => ({
        registerError: res.error,
        registerMessage: res.message,
    }));

export default register$;
