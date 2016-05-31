import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Reply} from '../db';
import {validateMessage} from './validateMessage';
import {prepareMessageProcessors} from './processMessage';

export default (app) => {
    const processMessage = prepareMessageProcessors(app);

    app.post('/api/chat/:team/:channel/reply/:message/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id, team, channel} = req.params;
        const replyTo = req.params.message;
        const message = _.omit(req.body, ['token']);
        logger.info('update reply: ', {replyTo, message, from: req.userInfo.username, channel});
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
        const m = await Reply.get(id).update({
            ...finalMessage,
            channel,
            replyTo,
        });
        logger.info('saved updated reply:', m);
        res.sendStatus(201);
    }));
};
