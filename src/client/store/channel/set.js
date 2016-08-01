import _ from 'lodash';
import {browserHistory} from 'react-router';
import {createAction} from 'rxstate';

// create action
export const setChannel = createAction();

// map to request
const channel$ = setChannel.$
    .throttle(50)
    .distinctUntilChanged(c => c, (a, b) => a && b && a.id === b.id)
    .filter(ch => ch !== undefined)
    // update url
    .do(channel => {
        const team = _.camelCase(channel.team.name);
        const ch = _.camelCase(channel.name);
        browserHistory.push(`/channels/${team}/${ch}`);
    })
    .do(ch => {
        if (!ch.team.name || !ch.name) {
            document.title = 'Shard: Communication Redefined';
            return;
        }

        document.title = `Shard: ${ch.team.name === 'me' ? 'Private' : ch.team.name} - ${ch.name}`;
    })
    // update store
    .map(channel => ({currentChannel: channel}));

export default channel$;
