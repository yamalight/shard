import jwtDecode from 'jwt-decode';
import {createAction} from 'rxstate';
import status from './status';
import post from '../../util/rxpost';

// create action
export const loginUser = createAction();

// map to request
const login$ = loginUser.$
    .do(() => status('loggingin'))
    .flatMap(user => post('/api/login', user))
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
    .do(res => (res.authError || !res.user ? status('error') : status('loggedin')));

export default login$;
