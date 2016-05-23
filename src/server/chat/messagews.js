import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {r} from '../db';
import {socket} from '../../../config';
import {userFields} from './dbconf';

export default (app) => {
    app.ws('/api/chat/:team/:channel', checkAuth, asyncRequest(async (ws, req) => {
        const channel = req.params.channel;
        logger.info('initing stream for channel:', channel);
        const messageStream = await r.table('Message').filter({channel})
            .changes()
            .map(c => c('new_val'))
            .merge(c => ({
                user: r.table('User').get(c('userId')).pluck(userFields),
                readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
            }))
            .run();
        messageStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel stream:', err);
                return;
            }

            const msg = {
                ...it,
                isNew: it.readBy.findIndex(el => el.id === ws.userInfo.id) === -1,
            };
            logger.debug('sending out message:', msg);
            ws.send(JSON.stringify(msg));
        });

        // replies
        const repliesStream = await r.table('Reply').filter({channel})
            .changes()
            .map(c => c('new_val'))
            .merge(c => ({
                user: r.table('User').get(c('userId')).pluck(userFields),
                readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
            }))
            .run();
        repliesStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel reply stream:', err);
                return;
            }

            const msg = {
                ...it,
                isNew: it.readBy.findIndex(el => el.id === ws.userInfo.id) === -1,
            };
            logger.debug('sending out reply:', msg);
            ws.send(JSON.stringify(msg));
        });

        // setup pings
        const pingInterval = setInterval(() => {
            ws.ping();
        }, socket.pingTime);

        // cleanup on socket close
        const clean = () => {
            logger.debug('cleaning up socket!');
            messageStream.close();
            repliesStream.close();
            clearInterval(pingInterval);
        };
        ws.on('error', clean);
        ws.on('close', clean);
    }));
};
