import {createStore} from 'rxstate';

// get defaul state
import defaultState from './defaultState';

// plug in auth actions
import authStatus from './auth/status';
import register$, {registerUser} from './auth/register';
import login$, {loginUser} from './auth/login';

// plug in team actions
import teamStatus from './team/status';
import createTeam$, {createTeam} from './team/create';
import getTeams$, {getTeams} from './team/get';
import setTeam$, {setTeam} from './team/set';

// plug in channel actions
import channelStatus from './channel/status';
import createChannel$, {createChannel} from './channel/create';
import getChannels$, {getChannels} from './channel/get';
import setChannel$, {setChannel} from './channel/set';


// create an array of action streams for store
const streams = [
    // auth streams
    authStatus.$,
    register$,
    login$,
    // team streams
    teamStatus.$,
    getTeams$,
    createTeam$,
    setTeam$,
    // channel stream
    channelStatus.$,
    getChannels$,
    createChannel$,
    setChannel$,
];
// create store
const store = createStore({streams, defaultState});

export {
    // auth
    registerUser,
    loginUser,
    // team
    getTeams,
    createTeam,
    setTeam,
    // channel
    getChannels,
    createChannel,
    setChannel,
};

export default store;
