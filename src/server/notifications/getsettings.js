import {Settings} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';
import {defaultSettings} from './createNotification';

export default (app) => {
    app.get('/api/notifications/:channel/settings', checkAuth, asyncRequest(async (req, res) => {
        const {channel} = req.params;
        logger.info('getting notifications settings for', req.userInfo.username, 'and channel:', channel);
        const set = await Settings
            .filter({user: req.userInfo.id, channel})
            .limit(1);
        const settings = set.pop() || defaultSettings;
        logger.info('got settings:', settings);
        res.status(200).json({settings});
    }));
};
