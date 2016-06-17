import {createAction} from 'rxstate';

// create action
export const selectMessage = createAction();

// map to request
const chat$ = selectMessage.$
    .map(selectedMessage => ({selectedMessage}));

export default chat$;
