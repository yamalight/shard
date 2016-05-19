import {socket} from '../../util';

export const chatSockets = {};

// create action
export const initChat = ({team, channel}) => {
    if (chatSockets[team + channel] && !chatSockets[team + channel].isStopped) {
        return chatSockets[team + channel];
    }

    chatSockets[team + channel] = socket(`/api/chat/${team}/${channel}?token=${localStorage.getItem('token')}`);
    return chatSockets[team + channel];
};

// close chat action
export const closeChat = (id) => {
    if (!chatSockets[id]) {
        return;
    }

    chatSockets[id].onCompleted();
};
