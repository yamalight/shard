import {createAction} from 'rxstate';

// create action
export const activateInfobar = createAction();

// map to request
const infobar$ = activateInfobar.$
    .distinctUntilChanged()
    .map(id => ({activateInfobar: id}));

export default infobar$;
