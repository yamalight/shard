import uuid from 'node-uuid';
import {User, r} from '../db';
import {requireEmailValidation} from '../../../config';
import {logger, asyncRequest, sendEmail} from '../util';

export default (app) => {
    app.post('/api/password/reset', asyncRequest(async (req, res) => {
        const host = process.env.SHARD_HOST || req.get('host');
        const {email} = req.body;
        const resetId = uuid.v4();
        logger.info('resetting password for:', {email, resetId});
        // check if email already used
        const users = await User.filter({email}).limit(1).run();
        logger.debug('found users by email:', users);
        const message = 'Check your email for further instructions!';
        if (users.length === 0) {
            logger.error('No user found!');
            res.send({message});
            return;
        }

        // get first match
        const user = users[0];

        if (!user) {
            logger.error('unknown error while resetting password!', user);
            res.send({message});
            return;
        }

        // save resetId to user
        user.passwordReset = {
            token: resetId,
            date: r.now(),
        };
        await user.save();

        // send reset email
        const resetLink = `http://${host}/api/password/reset/${resetId}`;
        logger.debug('reset link generated:', resetLink);
        if (requireEmailValidation) {
            const text = `Hi ${user.username},
            Please Click on the link to reset your password: ${resetLink}
            If you haven't requested the reset - just ignore this email.`;
            const html = `Hi ${user.username},<br/>
            Please Click on the link to reset your password.<br/>
            <a href="${resetLink}">Click here to reset password</a><br/>
            Or open this in a browser: ${resetLink}.<br/>
            If you haven't requested the reset - just ignore this email.`;

            // send email
            await sendEmail({
                to: email,
                subject: 'Shard.chat: Password Reset',
                text,
                html,
            });
            logger.debug('reset email sent to:', email);
        }

        logger.info('password reset for user: ', user);
        res.send({message});
    }));
};
