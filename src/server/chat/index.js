import checkAuth from '../auth/checkAuth';
import {logger} from '../util';
import {Message} from '../db';

export default (app) => {
    app.get('/api/test', checkAuth, (req, res) => {
        res.send(`You are in: ${JSON.stringify(req.user)}`);
    });

    app.get('/api/chat', async (req, res) => {
        const messages = await Message.find({}).populate('user');
        res.send(messages);
    });

    app.ws('/api/chat/:team/:channel', checkAuth, (ws, req, next) => {
        const channel = req.params.channel;
        const sendMessages = async () => {
            const messages = await Message.find({channel}).populate('user');
            ws.send(JSON.stringify(messages));
        };

        ws.on('message', async (data) => {
            logger.info('got msg:', data, 'from:', ws.userInfo.username, 'channel:', channel);
            const msg = JSON.parse(data);
            const m = new Message({
                ...msg,
                user: ws.userInfo._id,
                channel,
            });
            await m.save();
            logger.info('saved new message', m.toObject());
            ws.send(JSON.stringify(m.toObject()));
        });

        sendMessages();
        // next();
    });
};
