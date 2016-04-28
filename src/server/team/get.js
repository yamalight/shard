import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams', checkAuth, asyncRequest(async (req, res) => {
        logger.debug('searching for teams for', req.userInfo);
        const teams = await Team.find({'users.id': req.userInfo._id});
        res.status(200).json(teams);
    }));
};
