import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message} from '../db';

export default (app) => {
    app.get('/api/test', checkAuth, (req, res) => {
        res.send(`You are in: ${JSON.stringify(req.user)}`);
    });

    app.get('/api/chat', async (req, res) => {
        const messages = await Message.find({}).populate('user');
        res.send(messages);
    });

    app.get('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        logger.info('getting messages for channel:', channel);
        const messages = await Message.find({channel});
        logger.debug('got message', messages);
        res.send(messages);
    }));

    app.post('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const message = _.omit(req.body, ['token']);
        logger.info('got msg:', message, 'from:', req.userInfo.username, 'channel:', channel);
        const m = await Message.create({
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
        const messageStream = await Message.findStream({channel});
        messageStream.each((err, it) => {
            if (err) {
                logger.error('got err in channel stream:', err);
                return;
            }

            ws.send(JSON.stringify(it));
        });
        // cleanup on socket close
        ws.on('error', () => messageStream.close());
        ws.on('close', () => messageStream.close());
    }));
};
