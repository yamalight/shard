import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const updateTeam = createAction();

// map to request
const team$ = updateTeam.$
    .do(() => status('loading'))
    .map(team => sign(team))
    .flatMap(team => post(`/api/teams/${team.id}`, team))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => (res.error ?
        ({teamError: res.error, updatedTeam: undefined}) :
        ({teamError: undefined, updatedTeam: res}))
    );

export default team$;
