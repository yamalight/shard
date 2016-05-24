import {createAction} from 'rxstate';

// create action
export const setTeam = createAction();

// map to request
const team$ = setTeam.$
    .throttle(300)
    .distinctUntilChanged()
    .map(currentTeam => ({currentTeam}));

export default team$;
