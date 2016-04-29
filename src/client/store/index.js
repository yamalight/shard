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

// plug in chat actions
import chatStatus from './chat/status';
import {initChat} from './chat/connect';
import getChat$, {getChat} from './chat/get';
import {sendChat} from './chat/send';

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
    // channel streams
    channelStatus.$,
    getChannels$,
    createChannel$,
    setChannel$,
    // chat streams
    chatStatus.$,
    getChat$,
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
    // chat
    initChat,
    getChat,
    sendChat,
};

export default store;
