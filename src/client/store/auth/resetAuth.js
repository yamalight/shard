import {createAction} from 'rxstate';

// create action
export const resetAuth = createAction();

// map to request
const auth$ = resetAuth.$
    .do(() => {
        // remove expired token and user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    })
    .map(() => ({
        authError: undefined,
        token: undefined,
        user: undefined,
    }));

export default auth$;
