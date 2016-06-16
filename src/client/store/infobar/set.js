import {createAction} from 'rxstate';
import {setInfobarVisible} from './show';

// create action
export const setInfobar = createAction();

// map to request
const infobar$ = setInfobar.$
    .map(bar => ({infobar: bar}))
    .do(() => setInfobarVisible(true));

export default infobar$;
