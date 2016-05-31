import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message} from '../db';
import {validateMessage} from './validateMessage';
import {prepareMessageProcessors} from './processMessage';

export default (app) => {
    const processMessage = prepareMessageProcessors(app);

    app.post('/api/chat/:team/:channel/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id, team, channel} = req.params;
        const message = _.omit(req.body, ['id', 'token']);
        logger.info('update msg:', {message, from: req.userInfo.username, channel});
        // validate message
        const {valid, status, error} = validateMessage(message);
        if (!valid) {
            res.status(status).send({error});
            return;
        }

        const finalMessage = await processMessage({message, team, channel, user: req.userInfo});

        // if message is false - end without saving
        if (!finalMessage) {
            res.sendStatus(201);
            return;
        }

        // save
        const m = await Message.get(id).update({
            ...finalMessage,
            channel,
        });
        logger.info('saved updated message:', m);
        res.sendStatus(201);
    }));
};
