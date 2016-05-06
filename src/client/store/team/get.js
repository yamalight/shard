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
    .do(res => (res.error || !res.team ? status('error') : status('finished')))
    .map(res => {
        res.teamError = res.error; // eslint-disable-line
        return res;
    })
    .map(teams => (Array.isArray(teams) ? ({teams}) : ({...teams, teams: []})));

export default teams$;
