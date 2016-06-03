import {socket} from '../../util';

let statusSocket = undefined;

// create action
export const initUpdates = () => {
    if (statusSocket && !statusSocket.isStopped) {
        return statusSocket;
    }

    statusSocket = socket(`/api/updates?token=${localStorage.getItem('token')}`);
    return statusSocket;
};

// close chat action
export const closeUpdates = () => {
    if (!statusSocket) {
        return;
    }

    statusSocket.onCompleted();
};
