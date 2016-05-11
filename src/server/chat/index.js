import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message, r} from '../db';

export default (app) => {
    app.get('/api/test', checkAuth, (req, res) => {
        res.send(`You are in: ${JSON.stringify(req.user)}`);
    });

    app.get('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        logger.info('getting messages for channel:', channel);
        const historyReverse = await Message
            .orderBy(r.desc('time'))
            .filter({channel})
            .merge(c => ({user: r.table('User').get(c('user')).pluck(['id', 'username'])}))
            .limit(10)
            .execute();
        const history = historyReverse.reverse();
        logger.debug('got message', history);
        res.send({history});
    }));

    app.post('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const message = _.omit(req.body, ['token']);
        logger.info('got msg:', message, 'from:', req.userInfo.username, 'channel:', channel);
        const m = await Message.save({
            ...message,
            user: req.userInfo.id,
            channel,
        });
        logger.debug('saved new message:', m);
        res.sendStatus(201);
    }));

    app.ws('/api/chat/:team/:channel', checkAuth, asyncRequest(async (ws, req) => {
        const channel = req.params.channel;
        logger.info('initing stream for channel:', channel);
        const messageStream = await r.table('Message').filter({channel})
            .changes()
            .map(c => c('new_val'))
            .merge(c => ({user: r.table('User').get(c('user')).pluck(['id', 'username'])}))
            .run();
        messageStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel stream:', err);
                return;
            }

            logger.debug('sending out message:', it);
            ws.send(JSON.stringify(it));
        });
        // cleanup on socket close
        ws.on('error', () => messageStream.close());
        ws.on('close', () => messageStream.close());
    }));
};
