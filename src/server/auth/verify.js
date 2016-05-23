import {User} from '../db';
import {logger, asyncRequest} from '../util';

export default (app) => {
    app.get('/api/verify/:id', asyncRequest(async (req, res) => {
        const {id: verifyId} = req.params;
        logger.info('verifying email for:', verifyId);

        // check if verifyId is valid
        if (verifyId === '0') {
            logger.error('Incorrect verification token!');
            res.status(401).send('Incorrect verification token!');
            return;
        }

        // find matching user
        const users = await User
            .filter({verifyId, isEmailValid: false})
            .limit(1)
            .run();
        // get first one
        const user = users[0];

        // check if user was found
        if (!user) {
            logger.error('Incorrect verification token!');
            res.status(401).send('Incorrect verification token!');
            return;
        }

        logger.debug('got user: ', user);
        // update user to verified
        await User.get(user.id).update({isEmailValid: true, verifyId: '0'}).run();
        logger.info('verified email for:', user);
        // send success html
        res.redirect(`/?username=${encodeURIComponent(user.username)}&emailValid=true`);
    }));
};
