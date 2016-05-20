import {createAction} from 'rxstate';
import status from './status';
import {post, sign} from '../../util';

// create action
export const joinTeam = createAction();

// map to request
const joinTeam$ = joinTeam.$
    .do(() => status('loading'))
    .map(data => sign(data))
    .flatMap(({team, ...data}) => post(`/api/teams/${team}/join`, data))
    .do(res => (res.error ? status('error') : status('finished')))
    .map(res => {
        res.teamError = res.error; // eslint-disable-line
        res.joinedTeam = !res.error; // eslint-disable-line
        return res;
    });

export default joinTeam$;
