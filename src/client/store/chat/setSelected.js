import {createAction} from 'rxstate';

// create action
export const setSelected = createAction();

// map to request
const chat$ = setSelected.$
    .map(selectedMessages => ({selectedMessages}));

export default chat$;
