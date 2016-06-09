import {User} from '../db';
import {logger, asyncRequest} from '../util';

export default (app) => {
    app.post('/api/user/search', asyncRequest(async (req, res) => {
        const {username} = req.body;
        logger.info('searching for: ', username);
        // find user
        const users = await User.filter({isEmailValid: true})
        .filter(u => u('username').match(`(?i)${username}`))
        .without(['password', 'verifyId'])
        .run();

        logger.info('got users: ', users);
        // send users
        res.status(200).json({users});
    }));
};
