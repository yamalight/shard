import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {User} from '../db';
import {socket} from '../../../config';

// actions
import {teamUpdates} from './team';
import {channelUpdates} from './channel';
import {channelUnread} from './unread';

export default (app) => {
    app.ws('/api/updates', checkAuth, asyncRequest(async (ws) => {
        logger.info('initing update streams for user:', ws.userInfo.id);

        // update user to online
        await User.get(ws.userInfo.id).update({status: 'online'});

        // init team stream
        const teamStream = await teamUpdates(ws);
        const channelStream = await channelUpdates(ws);
        const unreadStream = await channelUnread(ws);

        // setup pings to keep socket alive
        const pingInterval = setInterval(() => ws.ping(), socket.pingTime);

        // cleanup on socket close
        const clean = () => {
            logger.debug('cleaning up updates socket!');
            teamStream.close();
            channelStream.close();
            unreadStream.close();
            User.get(ws.userInfo.id).update({status: 'offline'});
            clearInterval(pingInterval);
        };
        ws.on('error', clean);
        ws.on('close', clean);
    }));
};
