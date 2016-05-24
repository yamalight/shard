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
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ? ({teamError: res.error}) : ({newTeam: res})));

export default team$;
