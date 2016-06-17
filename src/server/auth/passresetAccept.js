import {User} from '../db';
import {logger, hash, asyncRequest} from '../util';

export default (app) => {
    app.get('/api/password/reset/:id', asyncRequest(async (req, res) => {
        const {id: resetId} = req.params;
        // verify that it's not -1
        if (resetId === '-1') {
            res.status(401).send('Error! Password reset request not found!');
            return;
        }
        // get error message if present
        const errorMessage = req.query.error || '';
        logger.debug('reset pass for: ', resetId);
        // find user
        const users = await User.filter({passwordReset: {token: resetId}}).limit(1).run();
        const user = users[0];
        // check for user and time validity
        const now = new Date().getTime() - 60 * 60 * 1000; // 60 mins expiration
        if (!user || user.passwordReset.date.getTime() < now) {
            logger.debug('error during password reset with user or date:', user);
            if (user) {
                user.passwordReset = {token: '-1', date: 0};
                await user.save();
            }
            res.status(500).send('Error! Password reset request not found!');
            return;
        }

        logger.debug('password reset for user: ', user);
        res.send(`
        <html>
            <body>
                ${errorMessage}
                <form action="/api/password/reset/${resetId}" method="post">
                    <input type="password" name="password" placeholder="Password">
                    <input type="password" name="passwordRepeat" placeholder="Repeat password">
                    <button type="submit">Change</button>
                </form>
            </body>
        </html>
        `);
    }));

    app.post('/api/password/reset/:id', asyncRequest(async (req, res) => {
        const {id: resetId} = req.params;
        const {password, passwordRepeat} = req.body;
        logger.debug('reset pass accept for: ', resetId, password, passwordRepeat);
        // redirect back if passwords not equal
        if (password !== passwordRepeat) {
            const error = encodeURIComponent('Passwords must match!');
            res.redirect(`/api/password/reset/${resetId}?error=${error}`);
            return;
        }

        // find user
        const users = await User.filter({passwordReset: {token: resetId}}).limit(1).run();
        const user = users[0];

        // check if user found
        if (!user) {
            logger.debug('reset user not found:', user);
            res.status(500).send('Error! Password reset request not found!');
            return;
        }

        // save to db
        const hashedPassword = hash(password);
        logger.debug('saving new password for: ', user.email, user.id, hashedPassword);
        user.password = hashedPassword;
        user.passwordReset = {token: '-1', date: 0};
        await user.save();

        logger.debug('password reset for user: ', user);
        // send success html
        res.redirect(`/?username=${encodeURIComponent(user.username)}&passwordReset=true`);
    }));
};
