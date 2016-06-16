import {createAction} from 'rxstate';

// create action
export const setInfobarType = createAction();

// map to request
const infobar$ = setInfobarType.$
    .filter(type => ['dock', 'sidebar'].includes(type)) // only allow two types
    .do(type => localStorage.setItem('shard.infobar.type', type)) // store for user
    .map(type => ({infobarType: type}));

export default infobar$;
