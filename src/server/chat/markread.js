import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message, Reply, r} from '../db';

export default (app) => {
    app.post('/api/chat/:team/:channel/read', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const {messages, replies} = req.body;
        logger.debug('marking as read:', {messages, replies, user: req.userInfo.username, channel});
        const m = await Message.getAll(...messages)
            .update({readBy: r.branch(
                r.row('readBy').contains(req.userInfo.id),
                r.row('readBy'),
                r.row('readBy').append(req.userInfo.id)
            )})
            .run();
        const repl = await Reply.getAll(...replies)
            .update({readBy: r.branch(
                r.row('readBy').contains(req.userInfo.id),
                r.row('readBy'),
                r.row('readBy').append(req.userInfo.id)
            )})
            .run();
        logger.debug('marked all as read:', m, repl);
        res.sendStatus(201);
    }));
};
