import {createAction} from 'rxstate';

// create action
export const getSelected = createAction();

// map to request
const chat$ = getSelected.$
    .map(() => 1)
    .scan((c, i) => c + i, 0)
    .map(getSelectedMessages => ({getSelectedMessages}));

export default chat$;
