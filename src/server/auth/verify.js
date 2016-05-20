import {User} from '../db';
import {logger, asyncRequest} from '../util';

export default (app) => {
    app.get('/api/verify/:id', asyncRequest(async (req, res) => {
        const {id: verifyId} = req.params;
        logger.debug('verifying email for:', verifyId);
        if (verifyId === '0') {
            res.status(401).send('Incorrect verification token!');
            return;
        }

        // find user
        const users = await User
            .filter({verifyId, isEmailValid: false})
            .limit(1)
            .run();

        const user = users.pop();

        // check if user was found
        if (!user) {
            res.status(401).send('Incorrect verification token!');
            return;
        }

        logger.debug('got user: ', user);
        await User.get(user.id).update({isEmailValid: true, verifyId: '0'}).run();
        res.status(200).send('Your email was successfully activated! You can login <a href="/">now</a>.');
    }));
};
