import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/teams/new', checkAuth, asyncRequest(async (req, res) => {
        const {name} = req.body;
        logger.debug('saving team with name:', name, 'and owner:', req.userInfo.username);
        const newTeam = new Team({
            name,
            users: [{
                id: req.userInfo._id,
                access: 'owner',
            }],
        });
        const team = await newTeam.save();
        logger.debug('saved new team:', team.toObject());
        res.status(200).json(team.toObject());
    }));
};
