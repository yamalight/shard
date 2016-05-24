import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getTeams = createAction();

// map to request
const teams$ = getTeams.$
    .do(() => status('loading'))
    .map(() => sign({}))
    .flatMap(({token}) => get('/api/teams', token))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(teams => (Array.isArray(teams) ? ({teams}) : ({teamError: teams.error, teams: []})));

export default teams$;
