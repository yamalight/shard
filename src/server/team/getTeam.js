import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        logger.info('getting team:', id, 'for user:', req.userInfo.username);
        const team = await Team.get(id).run();
        res.status(200).json({team});
    }));
};
