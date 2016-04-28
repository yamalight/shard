import {Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/new', checkAuth, asyncRequest(async (req, res) => {
        const {name, description, team} = req.body;
        logger.debug('saving channel with:', {name, description, team}, 'and owner:', req.userInfo.username);
        const newChannel = new Channel({
            name,
            description,
            users: [{
                id: req.userInfo._id,
                access: 'owner',
            }],
        });
        const channel = await newChannel.save();
        logger.debug('saved new channel:', channel.toObject());
        res.status(200).json(channel.toObject());
    }));
};
