import {createAction} from 'rxstate';
import {resetForward} from './resetForward';

// create action
export const replyTo = createAction();

// map to request
const replyTo$ = replyTo.$
    .do(() => resetForward())
    .map(replyToMessage => ({replyToMessage}));

export default replyTo$;
