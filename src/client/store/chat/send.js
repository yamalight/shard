// import {createAction} from 'rxstate';
// import status from './status';
import {chatSockets} from './connect';

// create action
export const sendChat = ({team, channel, message}) => {
    chatSockets[team + channel].onNext(JSON.stringify({message}));
};
