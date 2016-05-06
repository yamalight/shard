import {Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/new', checkAuth, asyncRequest(async (req, res) => {
        const {name, description, team} = req.body;
        logger.debug('saving channel with:', {name, description, team}, 'and owner:', req.userInfo.username);
        const channel = await Channel.create({
            name,
            description,
            team,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        });
        logger.debug('saved new channel:', channel);
        res.status(200).json(channel);
    }));
};
