import {createStore} from 'rxstate';

// get defaul state
import defaultState from './defaultState';

// plug in auth actions
import authStatus from './auth/status';
import register$, {registerUser} from './auth/register';
import login$, {loginUser} from './auth/login';

// team actions
import teamStatus from './team/status';
import createTeam$, {createTeam} from './team/create';
import getTeams$, {getTeams} from './team/get';
import getTeam$, {getTeam} from './team/getTeam';
import setTeam$, {setTeam} from './team/set';
import inviteUser$, {inviteUser} from './team/invite';
import joinTeam$, {joinTeam} from './team/join';
import resetNewTeam$, {resetNewTeam} from './team/resetNew';

// channel actions
import channelStatus from './channel/status';
import createChannel$, {createChannel} from './channel/create';
import getChannels$, {getChannels} from './channel/get';
import setChannel$, {setChannel} from './channel/set';
import resetNewChannel$, {resetNewChannel} from './channel/resetNew';
import resetChannels$, {resetChannels} from './channel/resetChannels';

// chat actions
import chatStatus from './chat/status';
import {initChat, closeChat} from './chat/connect';
import getChat$, {getChat} from './chat/get';
import getHistory$, {getHistory} from './chat/getHistory';
import sendChat$, {sendChat} from './chat/send';
import replyTo$, {replyTo} from './chat/replyTo';
import resetReply$, {resetReply} from './chat/resetReply';
import markRead$, {markRead} from './chat/markRead';

// infobar actions
import infobar$, {setInfobar} from './infobar/set';

// create an array of action streams for store
const streams = [
    // auth streams
    authStatus.$,
    register$,
    login$,
    // team streams
    teamStatus.$,
    getTeams$,
    getTeam$,
    createTeam$,
    setTeam$,
    inviteUser$,
    joinTeam$,
    resetNewTeam$,
    // channel streams
    channelStatus.$,
    getChannels$,
    createChannel$,
    setChannel$,
    resetNewChannel$,
    resetChannels$,
    // chat streams
    chatStatus.$,
    getChat$,
    getHistory$,
    sendChat$,
    replyTo$,
    resetReply$,
    markRead$,
    // infobar streams
    infobar$,
];
// create store
const store = createStore({streams, defaultState});

export {
    // auth
    registerUser,
    loginUser,
    // team
    getTeams,
    getTeam,
    createTeam,
    setTeam,
    inviteUser,
    joinTeam,
    resetNewTeam,
    // channel
    getChannels,
    createChannel,
    setChannel,
    resetNewChannel,
    resetChannels,
    // chat
    initChat,
    closeChat,
    getChat,
    getHistory,
    sendChat,
    replyTo,
    resetReply,
    markRead,
    // infobar
    setInfobar,
};

// store.subscribe(s => console.log(`state update:
// ${JSON.stringify(s.toJS(), null, 4)}`));

export default store;
