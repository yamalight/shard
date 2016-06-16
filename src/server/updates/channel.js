import {logger, meTeam} from '../util';
import {r} from '../db';

export const channelUpdates = async (ws) => {
    // init team updates stream
    const channelStream = await r.table('Channel')
        .filter(ch => ch('users').contains(u => u('id').eq(ws.userInfo.id)))
        .changes()
        .map(c => c('new_val'))
        .merge(ch => ({
            team: r.table('Team').get(ch('team')).default(meTeam),
            subchannels: r.branch(
                ch('parent') !== 'none',
                [],
                r.table('Channel')
                .filter({parent: ch('id')})
                .filter(sch => sch('users').contains(u => u('id').eq(ws.userInfo.id)))
                .merge(sch => ({
                    team: r.table('Team').get(sch('team')).default(meTeam),
                }))
                .orderBy('name')
                .coerceTo('array'),
            ),
            name: r.branch(
                ch('type').eq('conversation'),
                r.table('User').get(ch('users').filter(u => u('id').ne(ws.userInfo.id))(0)('id'))('username'),
                ch('name')
            ),
        }))
        .run();

    // pass team updates to user through socket
    channelStream.each((err, channel) => {
        if (err) {
            logger.error('got err in channel updates stream:', err);
            return;
        }

        const result = {channel};
        logger.debug('sending out channel update message:', result);
        ws.send(JSON.stringify(result));
    });

    return channelStream;
};
