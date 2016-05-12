import {Channel, Subchannel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/new', checkAuth, asyncRequest(async (req, res) => {
        const {name, description, team, parent} = req.body;
        logger.debug('saving channel with:', {name, description, team, parent}, 'and owner:', req.userInfo.username);

        // init channel data
        const data = {
            name,
            description,
            team,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        };

        // check if we need to save subchannel
        if (parent !== 'none') {
            logger.debug('saving subchannel!');
            const subchannel = await Subchannel.save({
                ...data,
                parentChannel: parent,
            });
            logger.debug('saved new subchannel:', subchannel);
            res.status(200).json(subchannel);
            return;
        }

        // otherwise save channel
        const channel = await Channel.save(data);
        logger.debug('saved new channel:', channel);
        res.status(200).json(channel);
    }));
};
