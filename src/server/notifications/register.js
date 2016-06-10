import {User} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/notifications/register', checkAuth, asyncRequest(async (req, res) => {
        const {endpoint, key, authSecret} = req.body;
        logger.info('registering notifications for', req.userInfo.username, 'endpoint:', endpoint);
        // get user
        const user = await User.get(req.userInfo.id);
        // add endpoint if not yet added
        if (!user.subscriptions.find(it => it.endpoint === endpoint)) {
            user.subscriptions = user.subscriptions.concat([{endpoint, key, authSecret}]);
            await user.save();
        }
        res.sendStatus(204);
    }));
};
