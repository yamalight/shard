import {Observable} from 'rx';
import {logout} from './logout';

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
        logout(res.error);
    }
});
