import {logger} from '../util';
import {r} from '../db';

export const teamUpdates = async (ws) => {
    // init team updates stream
    const teamStream = await r.table('Team')
        .filter(team => team('users').contains(u => u('id').eq(ws.userInfo.id)))
        .changes()
        .map(c => c('new_val'))
        .run();

    // pass team updates to user through socket
    teamStream.each((err, team) => {
        if (err) {
            logger.error('got err in channel stream:', err);
            return;
        }

        const result = {team};
        logger.debug('sending out message:', result);
        ws.send(JSON.stringify(result));
    });

    return teamStream;
};
