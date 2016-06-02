import _ from 'lodash';
import {browserHistory} from 'react-router';
import {createAction} from 'rxstate';

// create action
export const setChannel = createAction();

// map to request
const channel$ = setChannel.$
    .throttle(300)
    .distinctUntilChanged()
    // update url
    .do(channel => {
        const team = _.camelCase(channel.team.name);
        const ch = _.camelCase(channel.name);
        browserHistory.push(`/channels/${team}/${ch}`);
    })
    // update store
    .map(channel => ({currentChannel: channel}));

export default channel$;
