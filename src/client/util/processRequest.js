import {browserHistory} from 'react-router';
import {Observable} from 'rx';
import {resetAuth} from '../store';

const {just} = Observable;

export const processRequest = (req) => req.map(res => {
    try {
        return JSON.parse(res.response);
    } catch (e) {
        return {};
    }
})
.catch(err => (
    err.xhr && err.xhr.response ?
    just({...JSON.parse(err.xhr.response), status: err.xhr.status}) :
    just({error: err, status: err.xhr ? err.xhr.status : 500})
))
.do((res) => {
    if (res && res.status === 401) {
        // reset auth
        resetAuth();
        // redirect to home with error
        browserHistory.push({
            url: '/',
            state: {
                error: res.error,
                relogin: true,
            },
        });
    }
});
