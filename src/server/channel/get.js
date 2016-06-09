import {Channel, Team, r} from '../db';
import {logger, asyncRequest, meTeam} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/channels', checkAuth, asyncRequest(async (req, res) => {
        const {team, type = 'channel'} = req.query;
        logger.info('searching for channels for', req.userInfo.username, 'and team', team);
        const channels = await Channel
            .filter({type, parent: 'none'})
            .filter(ch => r.branch(
                type === 'conversation',
                true,
                ch('team').eq(team)
            ))
            .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)))
            .merge(ch => ({
                team: r.table('Team').get(ch('team')).default(meTeam),
                subchannels: r.table('Channel')
                    .filter({team, type, parent: ch('id')})
                    .filter(sch => sch('users').contains(u => u('id').eq(req.userInfo.id)))
                    .merge(sch => ({
                        team: r.table('Team').get(sch('team')),
                    }))
                    .orderBy('name')
                    .coerceTo('array'),
                name: r.branch(
                    type === 'conversation',
                    r.table('User').get(ch('users').filter(u => u('id').ne(req.userInfo.id))(0)('id'))('username'),
                    ch('name')
                ),
            }))
            .merge(ch => ({
                unread: r.table('Unread')
                    .filter({channel: ch('id'), team: ch('team')('id'), user: req.userInfo.id})
                    .limit(1)(0)
                    .default({count: 0})('count'),
            }))
            .orderBy('name')
            .execute();
        res.status(200).json(channels);
    }));
};
