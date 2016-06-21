import {browserHistory} from 'react-router';
import {resetAuth} from '../store';

export const logout = (errorMessage) => {
    // reset auth
    resetAuth();
    // redirect to home with error
    if (errorMessage) {
        browserHistory.push({
            url: '/',
            state: {
                error: errorMessage,
                relogin: true,
            },
        });
    } else {
        window.location.href = `${window.location.protocol}//${window.location.host}/`;
    }
};
