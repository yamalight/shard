import {createAction} from 'rxstate';

// create action
export const setInfobar = createAction();

// map to request
const infobar$ = setInfobar.$
    .map(bar => ({infobar: bar}));

export default infobar$;
