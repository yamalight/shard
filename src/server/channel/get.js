import {Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/channels', checkAuth, asyncRequest(async (req, res) => {
        const {team} = req.query;
        logger.debug('searching for channels for', req.userInfo, 'and team', team);
        const channels = await Channel
            .filter({team})
            .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)))
            .run();
        res.status(200).json(channels);
    }));
};
