import {Channel, User} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/user/conversation', checkAuth, asyncRequest(async (req, res) => {
        const {user} = req.body;
        logger.info('creating new conversation with:', user, 'and owner:', req.userInfo.username);
        // find user
        const guest = await User.get(user);
        // do not create duplicate channels under same team & parent
        const existing = await Channel
                .filter(row =>
                    row('team').eq(req.userInfo.id)
                    .and(row('type').eq('conversation'))
                    .and(row('name').downcase().eq(guest.username.toLowerCase()))
                )
                .count()
                .execute();
        if (existing > 0) {
            res.status(400).send({error: 'Conversation with that user already exists!'});
            return;
        }
        // init channel data
        const data = {
            name: guest.username.toLowerCase(),
            description: `Private conversation between ${req.userInfo.username} and ${guest.username}`,
            team: req.userInfo.id,
            isPrivate: true,
            type: 'conversation',
            users: [{
                id: req.userInfo.id,
                access: 'owner',
            }, {
                id: guest.id,
                access: 'member',
            }],
        };

        // otherwise save channel
        const conversation = await Channel.save(data);
        logger.info('saved new conversation:', conversation);
        res.status(200).json({conversation});
    }));
};
