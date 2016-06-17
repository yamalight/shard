import _ from 'lodash';
import {browserHistory} from 'react-router';
import {createAction} from 'rxstate';
import {resetChannels} from '../channel/resetChannels';
import {resetHistory} from '../chat/resetHistory';

// create action
export const setTeam = createAction();

// map to request
const team$ = setTeam.$
    .throttle(300)
    .distinctUntilChanged()
    .do(team => browserHistory.push(`/channels/${_.camelCase(team.name)}`))
    .do(() => resetChannels())
    .do(() => resetHistory())
    .do(team => { document.title = `Shard: ${team.name === 'me' ? 'Private' : team.me}`; })
    .map(currentTeam => ({currentTeam}));

export default team$;
