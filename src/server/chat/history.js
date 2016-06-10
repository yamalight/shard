import checkAuth from '../auth/checkAuth';
import {logger, asyncRequest, userFields, messageJoin} from '../util';
import {Message, r} from '../db';

const HISTORY_LIMIT = 20;

export default (app) => {
    app.get('/api/chat/:team/:channel', checkAuth, asyncRequest(async (req, res) => {
        const startFrom = req.query.startFrom ? new Date(parseInt(req.query.startFrom, 10)) : new Date();
        const {channel} = req.params;
        logger.info('getting history for channel:', channel, 'starting from:', startFrom);
        const historyReverse = await Message
            .orderBy(r.desc('time'))
            .getJoin(messageJoin)
            .filter(row => row('channel').eq(channel).and(row('time').lt(startFrom)))
            .merge(c => ({
                readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
            }))
            .limit(HISTORY_LIMIT)
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
