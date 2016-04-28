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
    .do(res => (res.teamError || !res.team ? status('error') : status('finished')))
    .map(teams => ({teams}));

export default teams$;
