import {createAction} from 'rxstate';

// create action
export const editSelectedMessage = createAction();

// map to request
const chat$ = editSelectedMessage.$
    .map((message) => ({editLastMessage: false, editSelectedMessage: message}));

export default chat$;
