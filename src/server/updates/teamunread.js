import {logger, meTeam} from '../util';
import {r} from '../db';

export const teamUnread = async (ws) => {
    // init team updates stream
    const unreadStream = await r.table('Unread')
        .filter({user: ws.userInfo.id})
        .changes()
        .map(c => c('new_val'))
        .map(c => r.table('Team')
            .get(c('team'))
            .default(meTeam)
            .merge({
                unread: c('count'),
            })
        )
        .run();

    // pass team updates to user through socket
    unreadStream.each((err, team) => {
        if (err) {
            logger.error('got err in team unread updates stream:', err);
            return;
        }

        const result = {team};
        logger.debug('sending out team unread update message:', result);
        ws.send(JSON.stringify(result));
    });

    return unreadStream;
};
