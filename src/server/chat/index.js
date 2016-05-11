import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message, Reply, r} from '../db';

const messageJoin = {
    replies: {
        _apply(sequence) {
            return sequence.orderBy('time').getJoin({user: true});
        },
    },
    user: true,
};

export default (app) => {
    app.get('/api/test', checkAuth, (req, res) => {
        res.send(`You are in: ${JSON.stringify(req.user)}`);
    });

    app.get('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        logger.info('getting messages for channel:', channel);
        const historyReverse = await Message
            .orderBy(r.desc('time'))
            .getJoin(messageJoin)
            .filter({channel})
            // .merge(c => ({user: r.table('User').get(c('user')).pluck(['id', 'username'])}))
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
        const m = new Message({
            ...message,
            channel,
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.debug('saved new message:', m);
        res.sendStatus(201);
    }));

    app.post('/api/chat/:team/:channel/reply/:message', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const replyTo = req.params.message;
        const message = _.omit(req.body, ['token']);
        logger.info('got reply: ', replyTo, ' with msg:', message, 'from:', req.userInfo.username, 'channel:', channel);
        const m = new Reply({
            ...message,
            channel,
            replyTo,
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.debug('saved new reply:', m);
        res.sendStatus(201);
    }));


    app.ws('/api/chat/:team/:channel', checkAuth, asyncRequest(async (ws, req) => {
        const channel = req.params.channel;
        logger.info('initing stream for channel:', channel);
        const messageStream = await r.table('Message').filter({channel})
            .changes()
            .map(c => c('new_val'))
            .merge(c => ({user: r.table('User').get(c('userId')).pluck(['id', 'username'])}))
            .run();
        messageStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel stream:', err);
                return;
            }

            logger.debug('sending out message:', it);
            ws.send(JSON.stringify(it));
        });

        // replies
        const repliesStream = await r.table('Reply').filter({channel})
            .changes()
            .map(c => c('new_val'))
            .merge(c => ({user: r.table('User').get(c('userId')).pluck(['id', 'username'])}))
            .run();
        repliesStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel reply stream:', err);
                return;
            }

            logger.debug('sending out reply:', it);
            ws.send(JSON.stringify(it));
        });

        // cleanup on socket close
        const clean = () => {
            messageStream.close();
            repliesStream.close();
        };
        ws.on('error', clean);
        ws.on('close', clean);
    }));
};
