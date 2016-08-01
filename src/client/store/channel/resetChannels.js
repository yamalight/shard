import {createAction} from 'rxstate';
import {setChannel} from './set';

// create action
export const resetChannels = createAction();

// map to request
const channel$ = resetChannels.$
    .do(() => setChannel())
    .map(() => ({
        channels: [],
        currentChannel: {},
    }));

export default channel$;
