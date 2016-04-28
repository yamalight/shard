import {createAction} from 'rxstate';

// create action
export const setChannel = createAction();

// map to request
const channel$ = setChannel.$
    .map(channel => ({currentChannel: channel}));

export default channel$;
