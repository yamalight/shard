import {createAction} from 'rxstate';

// create action
export const resetNewChannel = createAction();

// map to request
const channel$ = resetNewChannel.$
    .map(() => ({newChannel: undefined}));

export default channel$;
