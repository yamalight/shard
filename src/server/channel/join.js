import {Channel, r} from '../db';
import {logger, asyncRequest, meTeam} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/:id/join', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        logger.info('joining channel:', {id}, 'with user:', req.userInfo.username);

        // update function, will update channel with user if needed
        const updateChannel = ch => ch.update({
            users: r.branch(
                r.row('users').contains(d => d.id === req.userInfo.id),
                r.row('users'),
                r.row('users').append({
                    id: req.userInfo.id,
                    access: 'member',
                })
            ),
        });

        // get channel
        const ch = await Channel.get(id);
        // if no parent - just append to self
        if (ch.parent === 'none') {
            // update channel
            await updateChannel(Channel.get(id));
        } else { // otherwise appent to both - parent and self
            // update parent
            await updateChannel(Channel.get(ch.parent));
            // update channel
            await updateChannel(Channel.get(id));
        }

        // append team info
        const team = await r.table('Team').get(ch.team).default(meTeam);
        const channel = {
            ...ch,
            team,
        };

        logger.info('added user to channel:', channel);
        res.status(200).json(channel);
    }));
};
