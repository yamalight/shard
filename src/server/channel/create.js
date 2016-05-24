import {Channel, Subchannel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/new', checkAuth, asyncRequest(async (req, res) => {
        const {name, description, team, parent} = req.body;
        logger.info('saving new channel:', {name, description, team, parent}, 'and owner:', req.userInfo.username);
        // do not create channel with empty name
        if (!name || !name.length) {
            res.status(400).send({error: 'No channel name given!'});
            return;
        }
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
            logger.info('saved new subchannel:', subchannel);
            res.status(200).json(subchannel);
            return;
        }

        // otherwise save channel
        const channel = await Channel.save(data);
        logger.info('saved new channel:', channel);
        res.status(200).json(channel);
    }));
};
