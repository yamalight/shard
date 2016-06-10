import {Channel, Unread} from '../db';
import {logger} from '../util';

export const changeUnread = async ({channel, team, user, mod = 1} = {}) => {
    logger.debug('incrementing for', {channel, team, user});
    // get all non-current users from channel
    const ch = await Channel.get(channel);
    const users = ch.users.filter(u => (mod > 0 ? u.id !== user.id : u.id === user.id));
    logger.debug('got users counts to be updated:', users);
    // get unread item
    await Promise.all(users.map(u => u.id).map(async (id) => {
        logger.debug('searching unread for:', id);
        // try to find unread
        const all = await Unread.filter({
            channel,
            team,
            user: id,
        }).limit(1);
        logger.debug('all unread:', all, all.length);
        if (all.length === 0) {
            const r = new Unread({
                channel,
                team,
                user: id,
                count: 1,
            });
            await r.save();
            logger.debug('inserted new unread count:', r);
            return r;
        }

        // update
        const unread = all[0];
        unread.count += mod;
        if (unread.count < 0) {
            unread.count = 0;
        }
        const r = await unread.save();
        logger.debug('updated unread count:', r);
        return r;
    }));
};
