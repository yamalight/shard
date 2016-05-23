import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message} from '../db';

export default (app) => {
    app.post('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const message = _.omit(req.body, ['token']);
        logger.info('new msg:', {message, from: req.userInfo.username, channel});
        const m = new Message({
            ...message,
            channel,
            readBy: [req.userInfo.id],
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.info('saved new message:', m);
        res.sendStatus(201);
    }));
};
