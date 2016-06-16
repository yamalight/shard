import {createAction} from 'rxstate';

// create action
export const setInfobarVisible = createAction();

// map to request
const infobar$ = setInfobarVisible.$
    .map(infobarShow => ({infobarShow}));

export default infobar$;
