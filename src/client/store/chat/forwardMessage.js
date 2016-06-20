import {createAction} from 'rxstate';
import {resetReply} from './resetReply';

// create action
export const forwardMessage = createAction();

// map to request
const forwardMessage$ = forwardMessage.$
    .do(() => resetReply())
    .map(msg => ({forwardMessage: msg}));

export default forwardMessage$;
