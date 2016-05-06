import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const createTeam = createAction();

// map to request
const team$ = createTeam.$
    .do(() => status('loading'))
    .map(team => sign(team))
    .flatMap(team => post('/api/teams/new', team))
    .do(res => (res.error || !res.team ? status('error') : status('finished')))
    .map(res => {
        res.teamError = res.error; // eslint-disable-line
        return res;
    })
    .map(res => ({newTeam: res}));

export default team$;