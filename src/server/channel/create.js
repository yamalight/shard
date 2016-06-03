import {Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/new', checkAuth, asyncRequest(async (req, res) => {
        const {name, description, team, parent, isPrivate} = req.body;
        logger.info('saving new channel:', {name, description, team, parent, isPrivate},
            'and owner:', req.userInfo.username);
        // do not create channel with empty name
        if (!name || !name.length) {
            res.status(400).send({error: 'No channel name given!'});
            return;
        }
        // do not create non alpha-numeric channels
        const nameRegex = /^[a-z0-9\s-]+$/i;
        if (!nameRegex.test(name)) {
            res.status(400).send({error: 'Channel name must be alpha-numeric with spaces and dashes!'});
            return;
        }
        // do not create duplicate channels under same team & parent
        const existing = await Channel
                .filter(row =>
                    row('team').eq(team)
                    .and(row('name').downcase().eq(name.toLowerCase()))
                )
                .count()
                .execute();
        if (existing > 0) {
            res.status(400).send({error: 'Channel with that name already exists!'});
            return;
        }
        // init channel data
        const data = {
            name,
            description,
            team,
            isPrivate,
            parent,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        };

        // otherwise save channel
        const channel = await Channel.save(data);
        logger.info('saved new channel:', channel);
        res.status(200).json(channel);
    }));
};
