import {createAction} from 'rxstate';

// create action
export const editLastMessage = createAction();

// map to request
const chat$ = editLastMessage.$
    .map(() => ({editLastMessage: true}));

export default chat$;
