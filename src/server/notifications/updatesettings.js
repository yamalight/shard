import {Settings} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/notifications/:channel/settings', checkAuth, asyncRequest(async (req, res) => {
        const {channel} = req.params;
        const {notifications} = req.body;
        logger.info('updating notifications settings:', {u: req.userInfo.username, channel, notifications});
        const set = await Settings
            .filter({user: req.userInfo.id, channel})
            .limit(1);
        const settings = set.pop() || new Settings({channel, user: req.userInfo.id});
        settings.notifications = notifications;
        const r = await settings.save();
        logger.info('saved settings:', r);
        res.status(200).json(r);
    }));
};
