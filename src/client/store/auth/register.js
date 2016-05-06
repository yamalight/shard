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
    .map(res => {
        // get token
        const {token} = res;
        // try to parse out user
        if (token) {
            res.user = jwtDecode(token); // eslint-disable-line
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(res.user));
        }
        return res;
    })
    .map(res => {
        res.registerError = res.error; // eslint-disable-line
        return res;
    })
    .do(res => (res.registerError || !res.user ? status('error') : status('registered')));

export default register$;
