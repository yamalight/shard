import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/teams/new', checkAuth, asyncRequest(async (req, res) => {
        const {name} = req.body;
        logger.debug('saving team with name:', name, 'and owner:', req.userInfo.username);
        const team = await Team.create({
            name,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        });

        logger.debug('saved new team:', team);
        res.status(200).json(team);
    }));
};
