import {createAction} from 'rxstate';

// create action
export const resetNewTeam = createAction();

// map to request
const team$ = resetNewTeam.$
    .map(() => ({newTeam: undefined}));

export default team$;
