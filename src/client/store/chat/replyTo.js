import {createAction} from 'rxstate';

// create action
export const replyTo = createAction();

// map to request
const replyTo$ = replyTo.$
    .map(replyToMessage => ({replyToMessage}));

export default replyTo$;
