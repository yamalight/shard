import {Team, r} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.get('/api/teams', checkAuth, asyncRequest(async (req, res) => {
        logger.info('getting for teams for', req.userInfo.username);
        const teams = await Team
            .filter(team => team('users').contains(u => u('id').eq(req.userInfo.id)))
            .merge(team => ({
                unread: r.table('Unread')
                    .filter({team: team('id'), user: req.userInfo.id})
                    .reduce((left, right) => left('count').add(right('count')))
                    .default(0),
            }))
            .orderBy('name')
            .run();
        res.status(200).json(teams);
    }));
};
