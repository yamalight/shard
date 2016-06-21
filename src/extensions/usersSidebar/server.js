import UsersSidebar from './base';

class UsersSidebarServer extends UsersSidebar {
    withoutFields = ['password', 'verifyId', 'subscriptions', 'passwordReset', 'isEmailValid', 'email']

    constructor({route, wsRoute, db, util}) {
        super();

        const {asyncRequest, logger} = util;

        route.post(asyncRequest(async (req, res) => {
            const {team, channel} = req.body;
            logger.debug('got users sidebar req:', team, channel);

            const ch = await db.Channel.get(channel);
            const users = await Promise.all(
                ch.users.map(u => db.User
                    .get(u.id)
                    .without(this.withoutFields)
                    .execute()
                )
            );

            res.send({users});
        }));

        wsRoute(asyncRequest(async (ws, req) => {
            const {channel} = req.query;
            logger.info('initing users streams for channel:', channel);

            // define one ref to users stream
            let usersStream;

            // init channel users stream
            const channelUsersStream = await db.r.table('Channel').get(channel)
                .changes({includeInitial: true})
                .map(c => c('new_val'))
                .map(chan => chan('users'))
                .map(u => u('id'))
                .run();
            // subscribe to new users list
            channelUsersStream.each(async (err, users) => {
                // catch error
                if (err) {
                    logger.error('got err in channel users stream:', err);
                    return;
                }

                logger.debug('getting stream for:', users);

                // kill old users stream if present
                if (usersStream) {
                    usersStream.close();
                }

                // init new users stream
                usersStream = await db.r.table('User')
                    .getAll(...users)
                    .without(this.withoutFields)
                    .changes()
                    .map(c => c('new_val'))
                    .run();

                // pass messages to user through socket
                usersStream.each((usErr, user) => {
                    if (usErr) {
                        logger.error('got err in users stream:', usErr);
                        return;
                    }

                    logger.debug('sending out user:', user);
                    ws.send(JSON.stringify(user));
                });
            });

            // setup pings to keep socket alive
            const pingInterval = setInterval(() => ws.ping(), 30000);

            // cleanup on socket close
            const clean = () => {
                logger.debug('cleaning up users socket!');
                channelUsersStream.close();
                if (usersStream) {
                    usersStream.close();
                }
                clearInterval(pingInterval);
            };
            ws.on('error', clean);
            ws.on('close', clean);
        }));
    }
}

export default [UsersSidebarServer];
