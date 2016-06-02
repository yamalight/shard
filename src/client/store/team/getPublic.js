import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getPublicTeams = createAction();

// map to request
const teams$ = getPublicTeams.$
    .do(() => status('loading'))
    .map(() => sign({}))
    .flatMap(({token}) => get('/api/teams/public', token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(publicTeams => (
        Array.isArray(publicTeams) ? ({publicTeams}) : ({teamError: publicTeams.error, publicTeams: []})
    ));

export default teams$;
