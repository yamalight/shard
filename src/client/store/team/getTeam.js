import {createAction} from 'rxstate';
import status from './status';
import {get, sign} from '../../util';

// create action
export const getTeam = createAction();

// map to request
const team$ = getTeam.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(({team, token}) => get(`/api/teams/${team}`, token))
    .do(res => (res.error || !res.team ? status('error') : status('finished')))
    .map(res => {
        res.teamError = res.error; // eslint-disable-line
        return res;
    });

export default team$;
