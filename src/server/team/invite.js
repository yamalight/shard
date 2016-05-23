import {Team, Channel, User} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/teams/:id/join', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {channel} = req.body;
        const username = req.userInfo.username;
        logger.info('adding user to channel via URL:', {username, channel});

        // get team
        const team = await Team.get(id);
        // add user to team if he's not already there
        if (!team.users.find(u => u.id === req.userInfo.id)) {
            team.users.push({id: req.userInfo.id});
            await team.save();
        }

        // add user to channel (if present)
        if (channel) {
            const ch = await Channel.get(channel);
            // only add if not already in channel
            if (!ch.users.find(u => u.id === req.userInfo.id)) {
                ch.users.push({id: req.userInfo.id});
                await ch.save();
            }
        }

        logger.debug('added user to team via url!');
        res.sendStatus(204);
    }));

    app.post('/api/teams/:id/invite', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {username, channel} = req.body;
        logger.info('inviting user to channel:', {username, channel});

        // check user permissions for invite
        const team = await Team.get(id);
        const reqUser = team.users.filter(u => u.id === req.userInfo.id).pop();
        logger.debug('got requesting user from team:', reqUser);
        if (reqUser.access !== 'admin' && reqUser.access !== 'owner') {
            logger.error('insufficient rights!');
            res.status(401).send({error: 'insufficient rights!'});
            return;
        }

        // find user that's getting invited
        const users = await User.filter({username}).limit(1).run();
        const user = users.pop();
        logger.debug('found user:', user);
        if (!user) {
            logger.error('target user not found!');
            res.status(401).send({error: 'user not found!'});
            return;
        }

        // add user to team
        team.users.push({id: user.id});
        await team.save();

        // add user to channel (if present)
        if (channel) {
            const ch = await Channel.get(channel);
            ch.users.push({id: user.id});
            await ch.save();
        }

        logger.debug('invited user to team!');
        res.sendStatus(204);
    }));
};
