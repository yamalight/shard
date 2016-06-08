import {Channel, r} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/channels/public', checkAuth, asyncRequest(async (req, res) => {
        const {team} = req.query;
        logger.info('searching for public channels for', req.userInfo.username, 'and team', team);
        const channels = await Channel
            .filter({team, type: 'channel', isPrivate: false})
            .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)).not())
            .merge(ch => ({
                team: r.table('Team').get(ch('team')),
            }))
            .orderBy('name')
            .execute();
        res.status(200).json(channels);
    }));
};
