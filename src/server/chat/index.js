import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message, Reply, r} from '../db';
import {socket} from '../../../config';

const userFields = ['id', 'username', 'email'];

const messageJoin = {
    replies: {
        _apply(sequence) {
            return sequence.orderBy('time')
                .getJoin({user: true})
                .merge(c => ({
                    readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
                }));
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
            .merge(c => ({
                readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
            }))
            .limit(10)
            .execute();
        const history = historyReverse.reverse().map(msg => ({
            ...msg,
            replies: msg.replies.map(m => ({
                ...m,
                isNew: m.readBy.findIndex(el => el.id === req.userInfo.id) === -1,
            })),
            isNew: msg.readBy.findIndex(el => el.id === req.userInfo.id) === -1,
        }));
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
            readBy: [req.userInfo.id],
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.debug('saved new message:', m);
        res.sendStatus(201);
    }));

    app.post('/api/chat/:team/:channel/read', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const {messages, replies} = req.body;
        logger.info('marking as read:', messages, replies, 'for:', req.userInfo.username, 'channel:', channel);
        const m = await Message.getAll(...messages)
            .update({readBy: r.row('readBy').append(req.userInfo.id)})
            .run();
        const repl = await Reply.getAll(...replies)
            .update({readBy: r.row('readBy').append(req.userInfo.id)})
            .run();
        logger.debug('marked all as read:', m, repl);
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
            readBy: [req.userInfo.id],
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
