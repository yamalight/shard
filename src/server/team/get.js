import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams', checkAuth, asyncRequest(async (req, res) => {
        logger.debug('searching for teams for', JSON.stringify(req.userInfo));
        const teams = await Team
            .filter(team => team('users').contains(u => u('id').eq(req.userInfo.id)))
            .run();
        res.status(200).json(teams);
    }));
};
