import {createAction} from 'rxstate';

// create action
export const setInfobarType = createAction();

// map to request
const infobar$ = setInfobarType.$
    .filter(type => ['dock', 'sidebar'].includes(type)) // only allow two types
    .map(type => ({infobarType: type}));

export default infobar$;
