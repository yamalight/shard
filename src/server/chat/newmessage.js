import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message} from '../db';
import {validateMessage} from './validateMessage';

export default (app) => {
    const currentExtensions = app.get('currentExtensions');
    const messageExtensions = currentExtensions.filter(ex => ex.type === 'messageHandler');

    app.post('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        const message = _.omit(req.body, ['token']);
        logger.info('new msg:', {message, from: req.userInfo.username, channel});
        // validate message
        const {valid, status, error} = validateMessage(message);
        if (!valid) {
            res.status(status).send({error});
            return;
        }

        // test message with extensions
        const extensions = messageExtensions
            .filter(ex => ex.testMessage(message))
            .sort((a, b) => a.priority - b.priority);
        logger.debug('got extensions that can handle message:', extensions.map(ex => ex.constructor.name));

        // transform message with matched extensions
        const context = {
            user: req.userInfo,
        };
        const finalMessage = extensions.reduce((sum, ex) => ex.handleMessage(sum, context), message);
        logger.debug('final message after extensions is:', finalMessage);

        // if message is false - end without saving
        if (!finalMessage) {
            res.sendStatus(201);
            return;
        }

        // save
        const m = new Message({
            ...finalMessage,
            channel,
            readBy: [req.userInfo.id],
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.info('saved new message:', m);
        res.sendStatus(201);
    }));
};
