import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams/public', checkAuth, asyncRequest(async (req, res) => {
        logger.info('getting public teams for', req.userInfo.username);
        const teams = await Team
            .filter({isPrivate: false})
            .filter(team => team('users').contains(u => u('id').eq(req.userInfo.id)).not())
            .orderBy('name')
            .run();
        res.status(200).json(teams);
    }));
};
