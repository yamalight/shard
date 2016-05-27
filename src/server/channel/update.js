import {Channel, Subchannel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {name, description, team, parent = 'none'} = req.body;
        logger.info('updating channel:', id, 'with:', {name, description, team, parent}, 'by:', req.userInfo.username);
        // do not update channel with empty name
        if (!name || !name.length) {
            res.status(400).send({error: 'No channel name given!'});
            return;
        }
        // do not update non alpha-numeric channels
        const nameRegex = /^[a-z0-9\s-]+$/i;
        if (!nameRegex.test(name)) {
            res.status(400).send({error: 'Channel name must be alpha-numeric with spaces and dashes!'});
            return;
        }
        // do not update duplicate channels under same team & parent
        let existing = 0;
        if (parent === 'none') {
            existing = await Channel
                .filter(row =>
                    row('team').eq(team)
                    .and(row('name').downcase().eq(name.toLowerCase()))
                    .and(row('id').ne(id))
                )
                .count()
                .execute();
        } else {
            existing = await Subchannel
                .filter(row =>
                    row('parentChannel').eq(parent)
                    .and(row('team').eq(team))
                    .and(row('name').downcase().eq(name.toLowerCase()))
                    .and(row('id').ne(id))
                )
                .count()
                .execute();
        }
        if (existing > 0) {
            res.status(400).send({error: 'Channel with that name already exists!'});
            return;
        }
        // init channel data
        const data = {
            name,
            description,
            team,
        };

        // check if we need to save subchannel
        if (parent !== 'none') {
            logger.debug('saving subchannel!');
            const subchannel = await Subchannel.get(id).update({
                ...data,
                parentChannel: parent,
            });
            logger.info('updated subchannel:', subchannel);
            res.status(200).json(subchannel);
            return;
        }

        // otherwise save channel
        const channel = await Channel.get(id).update(data);
        logger.info('updated channel:', channel);
        res.status(200).json(channel);
    }));
};
