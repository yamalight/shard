import {browserHistory} from 'react-router';
import {resetAuth} from '../store';

export const logout = (errorMessage) => {
    // reset auth
    resetAuth();
    // redirect to home with error
    browserHistory.push({
        url: '/',
        state: {
            error: errorMessage,
            relogin: true,
        },
    });
};
