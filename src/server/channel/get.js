import {Channel, r} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/channels', checkAuth, asyncRequest(async (req, res) => {
        const {team} = req.query;
        logger.info('searching for channels for', req.userInfo.username, 'and team', team);
        const channels = await Channel
            .filter({team, parent: 'none'})
            .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)))
            .merge(ch => ({
                team: r.table('Team').get(ch('team')),
                subchannels: r.table('Channel')
                    .filter({team, parent: ch('id')})
                    .filter(sch => sch('users').contains(u => u('id').eq(req.userInfo.id)))
                    .merge(sch => ({
                        team: r.table('Team').get(sch('team')),
                    }))
                    .coerceTo('array'),
            }))
            .orderBy('name')
            .execute();
        res.status(200).json(channels);
    }));
};
