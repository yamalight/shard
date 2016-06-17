import {createAction} from 'rxstate';
import status from './status';
import {post} from '../../util';

// create action
export const resetPassword = createAction();

// map to request
const register$ = resetPassword.$
    .do(() => status('resetting'))
    .flatMap(({email}) => post('/api/password/reset', {email}))
    .do(res => (res.error ? status('error') : status('reset')))
    .map(res => ({
        passresetError: res.error,
        passresetMessage: res.message,
    }));

export default register$;
