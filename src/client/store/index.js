import {createStore} from 'rxstate';

// get defaul state
import defaultState from './defaultState';

// plug in auth actions
import authStatus from './auth/status';
import register$, {registerUser} from './auth/register';
import login$, {loginUser} from './auth/login';

// create an array of action streams for store
const streams = [
    // auth streams
    authStatus.$,
    register$,
    login$,
];
// create store
const store = createStore({streams, defaultState});

export {
    registerUser,
    loginUser,
};

export default store;
