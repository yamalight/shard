import {createAction} from 'rxstate';

// create action
export const focusInput = createAction();

// map to request
const chat$ = focusInput.$
    .map(() => 1)
    .scan((acc, c) => acc + c, 0) // increasing counter to evade re-triggering
    .map(c => ({focusInput: c}));

export default chat$;
