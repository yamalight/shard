import checkAuth from '../auth/checkAuth';
import {Message} from '../db';

export default (app) => {
    app.get('/api/test', checkAuth, (req, res) => {
        res.send(`You are in: ${JSON.stringify(req.user)}`);
    });

    app.get('/api/chat', async (req, res) => {
        const messages = await Message.find({});
        res.send(messages);
    });

    app.ws('/api/chat', (ws, req) => {
        ws.on('message', async (data) => {
            const msg = JSON.parse(data);
            const m = new Message(msg);
            await m.save();
            console.log('saved new message');
        });
    });
};
