import {Message} from '../db';

export default (app) => {
    app.get('/chat', async (req, res) => {
        const messages = await Message.find({});
        res.send(messages);
    });

    app.ws('/chat', (ws, req) => {
        ws.on('message', async (data) => {
            const msg = JSON.parse(data);
            const m = new Message(msg);
            await m.save();
            console.log('saved new message');
        });
    });
};
