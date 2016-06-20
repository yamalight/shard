import UsersSidebar from './base';

class UsersSidebarServer extends UsersSidebar {
    constructor({route, db, util}) {
        super();

        const {asyncRequest, logger} = util;

        route.post(asyncRequest(async (req, res) => {
            const {team, channel} = req.body;
            logger.debug('got users sidebar req:', team, channel);

            const ch = await db.Channel.get(channel);
            const users = await Promise.all(
                ch.users.map(u => db.User
                    .get(u.id)
                    .without(['password', 'verifyId', 'subscriptions', 'passwordReset', 'isEmailValid', 'email'])
                    .execute()
                )
            );

            res.send({users});
        }));
    }
}

export default [UsersSidebarServer];
