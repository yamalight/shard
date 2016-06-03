import {createAction} from 'rxstate';
import status from './status';
import {initUpdates} from './connect';

// create action
export const getUpdates = createAction();

// map to socket
const updates$ = getUpdates.$
    .flatMap(() => initUpdates()
        .map(e => JSON.parse(e.data))
        .map(updates => ({updates}))
    )
    .do(res => (res.error || !res.messsages ? status('error') : status('connected')));

export default updates$;
