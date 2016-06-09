import {Team, r} from '../db';
import {logger, asyncRequest, meTeam} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams', checkAuth, asyncRequest(async (req, res) => {
        logger.info('getting for teams for', req.userInfo.username);
        // get user teams
        const teams = await Team
            .filter(team => team('users').contains(u => u('id').eq(req.userInfo.id)))
            .merge(team => ({
                unread: r.table('Unread')
                    .filter({team: team('id'), user: req.userInfo.id})
                    .map(u => u('count'))
                    .reduce((left, right) => left.add(right))
                    .default(0),
            }))
            .orderBy('name')
            .run();
        // get meTeam with counts
        const unread = await r.table('Unread')
            .filter({team: meTeam.id, user: req.userInfo.id})
            .map(u => u('count'))
            .reduce((left, right) => left.add(right))
            .default(0);
        const meTeamWithCount = {
            ...meTeam,
            unread,
        };

        res.status(200).json([meTeamWithCount, ...teams]);
    }));
};
