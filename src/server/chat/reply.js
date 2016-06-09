import _ from 'lodash';
import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Reply} from '../db';
import {validateMessage} from './validateMessage';
import {prepareMessageProcessors} from './processMessage';
import {changeUnread} from '../unread';

export default (app) => {
    const processMessage = prepareMessageProcessors(app);

    app.post('/api/chat/:team/:channel/reply/:message', checkAuth, asyncRequest(async (req, res) => {
        const {team, channel} = req.params;
        const replyTo = req.params.message;
        const message = _.omit(req.body, ['token']);
        logger.info('new reply: ', {replyTo, message, from: req.userInfo.username, channel});
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
        const m = new Reply({
            ...finalMessage,
            channel,
            replyTo,
            readBy: [req.userInfo.id],
        });
        m.user = req.userInfo;
        await m.saveAll({user: true});
        logger.info('saved new reply:', m);

        // increment unread
        await changeUnread({team, channel, user: req.userInfo});

        res.sendStatus(201);
    }));
};
