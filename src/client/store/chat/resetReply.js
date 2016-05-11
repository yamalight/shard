import {createAction} from 'rxstate';

// create action
export const resetReply = createAction();

// map to request
const chat$ = resetReply.$
    .map(() => ({replyToMessage: undefined}));

export default chat$;
