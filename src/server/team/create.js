import {Team, Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/teams/new', checkAuth, asyncRequest(async (req, res) => {
        const {name} = req.body;
        logger.info('saving new team:', {name, owner: req.userInfo.username});
        // save new team
        const team = await Team.save({
            name,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        });
        logger.debug('saved new team:', team);

        // create default #general channel
        logger.debug('creating new default channel...');
        // init channel data
        const data = {
            name: 'general',
            description: 'General channel created by default',
            team: team.id,
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }],
        };
        // save channel
        const channel = await Channel.save(data);
        logger.debug('saved new channel:', channel);

        // send team back
        res.status(200).json(team);
    }));
};
