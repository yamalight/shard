import {createAction} from 'rxstate';

// create action
export const resetForward = createAction();

// map to request
const chat$ = resetForward.$
    .map(() => ({forwardMessage: undefined}));

export default chat$;
