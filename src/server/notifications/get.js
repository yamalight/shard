import {Notification, r} from '../db';
import {logger, asyncRequest, meTeam} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/notifications', checkAuth, asyncRequest(async (req, res) => {
        logger.info('getting notifications for', req.userInfo.username);
        // get user notifications
        const notifications = await Notification
            .filter({user: req.userInfo.id})
            .merge(n => ({
                team: r.table('Team').get(n('team')).default(meTeam),
                channel: r.table('Channel').get(n('channel')),
            }))
            .orderBy(r.desc('time'))
            .limit(20)
            .execute();
        res.status(200).json({notifications});
    }));
};
