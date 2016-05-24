import {createAction} from 'rxstate';

// create action
export const resetChannels = createAction();

// map to request
const channel$ = resetChannels.$
    .map(() => ({channels: []}));

export default channel$;
