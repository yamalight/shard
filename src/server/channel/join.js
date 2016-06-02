import {Channel, r} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/channels/:id/join', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        logger.info('joining channel:', {id}, 'with user:', req.userInfo.username);
        // update channel if needed
        const ch = await Channel.get(id)
        .update({
            users: r.branch(
                r.row('users').contains(d => d.id === req.userInfo.id),
                r.row('users'),
                r.row('users').append({
                    id: req.userInfo.id,
                    access: 'member',
                })
            ),
        });

        // append team info
        const team = await r.table('Team').get(ch.team);
        const channel = {
            ...ch,
            team,
        };

        logger.info('added user to channel:', channel);
        res.status(200).json(channel);
    }));
};
