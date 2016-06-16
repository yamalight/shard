import {Channel, Settings} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';
import {getDefaultSettings} from './createNotification';

export default (app) => {
    app.get('/api/notifications/:channel/settings', checkAuth, asyncRequest(async (req, res) => {
        const {channel} = req.params;
        const ch = await Channel.get(channel);
        logger.info('getting notifications settings for', req.userInfo.username, 'and channel:', ch);
        const set = await Settings
            .filter({user: req.userInfo.id, channel})
            .limit(1);
        const settings = set.pop() || getDefaultSettings(ch);
        logger.info('got settings:', settings);
        res.status(200).json({settings});
    }));
};
