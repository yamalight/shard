import {logger, meTeam} from '../util';
import {r} from '../db';

export const channelUnread = async (ws) => {
    // init team updates stream
    const unreadStream = await r.table('Unread')
        .filter({user: ws.userInfo.id})
        .changes()
        .map(c => c('new_val'))
        .map(c => r.table('Channel')
            .get(c('channel'))
            .merge(ch => ({
                team: r.table('Team').get(ch('team')).default(meTeam),
                subchannels: r.branch(
                    ch('parent') !== 'none',
                    [],
                    r.table('Channel')
                    .filter({parent: ch('id')})
                    .filter(sch => sch('users').contains(u => u('id').eq(ws.userInfo.id)))
                    .merge(sch => ({
                        team: r.table('Team').get(sch('team')),
                    }))
                    .orderBy('name')
                    .coerceTo('array'),
                ),
                name: r.branch(
                    ch('type').eq('conversation'),
                    r.table('User').get(ch('users').filter(u => u('id').ne(ws.userInfo.id))(0)('id'))('username'),
                    ch('name')
                ),
                unread: c('count'),
            }))
        )
        .run();

    // pass team updates to user through socket
    unreadStream.each((err, channel) => {
        if (err) {
            logger.error('got err in unread updates stream:', err);
            return;
        }

        const result = {channel};
        logger.debug('sending out unread update message:', result);
        ws.send(JSON.stringify(result));
    });

    return unreadStream;
};
