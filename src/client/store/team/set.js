import {createAction} from 'rxstate';

// create action
export const setTeam = createAction();

// map to request
const team$ = setTeam.$
    .map(team => ({currentTeam: team}));

export default team$;
