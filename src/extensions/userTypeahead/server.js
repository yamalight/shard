import UserTypeahead from './base';

class UserTypeaheadServer extends UserTypeahead {
    constructor({route, db, util}) {
        super();

        const {asyncRequest, logger} = util;

        route.post(asyncRequest(async (req, res) => {
            const {text, currentChannel} = req.body;
            logger.debug('got user typeahead req:', text, currentChannel);
            let channel;
            try {
                channel = await db.Channel.get(currentChannel);
            } catch (e) {
                if (e.name !== 'DocumentNotFoundError') {
                    throw e;
                }
                channel = await db.Subchannel.get(currentChannel);
            }

            if (!channel) {
                throw new Error('Channel not found!');
            }

            logger.debug('found channel:', channel);
            const {users} = channel;
            const userIds = users.map(u => u.id);
            const userList = await db.User
                .getAll(...userIds)
                .filter(r => r('username').match(`(?i)^${text}`))
                .without(['password'])
                .run();

            res.send({users: userList});
        }));
    }
}

export default [UserTypeaheadServer];
