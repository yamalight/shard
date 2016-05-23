import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest} from '../util';
import {Message, r} from '../db';
import {userFields, messageJoin} from './dbconf';

export default (app) => {
    app.get('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const channel = req.params.channel;
        logger.info('getting messages for channel:', channel);
        const historyReverse = await Message
            .orderBy(r.desc('time'))
            .getJoin(messageJoin)
            .filter({channel})
            .merge(c => ({
                readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
            }))
            .limit(10)
            .execute();
        const history = historyReverse.reverse().map(msg => ({
            ...msg,
            replies: msg.replies.map(m => ({
                ...m,
                isNew: m.readBy.findIndex(el => el.id === req.userInfo.id) === -1,
            })),
            isNew: msg.readBy.findIndex(el => el.id === req.userInfo.id) === -1,
        }));
        logger.debug('got message', history);
        res.send({history});
    }));
};
