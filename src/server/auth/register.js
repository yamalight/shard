import uuid from 'node-uuid';
import {User} from '../db';
import {requireEmailValidation} from '../../../config';
import {logger, hash, asyncRequest, sendEmail} from '../util';

export default (app) => {
    app.post('/api/register', asyncRequest(async (req, res) => {
        const host = process.env.SHARD_HOST || req.get('host');
        const {username, password: plainPass, email} = req.body;
        const password = hash(plainPass);
        const verifyId = uuid.v4();
        logger.info('adding new user:', {username, password, email, verifyId});
        logger.debug('email valudation is:', requireEmailValidation);
        // check if email already used
        let existingUserCount = await User.filter({email}).count().execute();
        logger.debug('checked email:', existingUserCount);
        if (existingUserCount > 0) {
            logger.error('Email already userd!');
            res.status(400).json({error: 'User with given email already exists!'});
            return;
        }
        // check if username already used
        existingUserCount = await User.filter({username}).count().execute();
        logger.debug('checked username:', existingUserCount);
        if (existingUserCount > 0) {
            logger.error('Username already used!');
            res.status(400).json({error: 'User with given username already exists!'});
            return;
        }

        // find user
        const user = await User.save({
            username,
            password,
            email,
            verifyId,
            isEmailValid: !requireEmailValidation,
        });

        if (!user) {
            logger.error('unknown error while creating user during registration!');
            res.status(500).json({error: 'Error while creating user!'});
            return;
        }

        if (requireEmailValidation) {
            // send email
            const verifyLink = `http://${host}/api/verify/${verifyId}`;
            const text = `Hi ${username},
            Please Click on the link to verify your email: ${verifyLink}`;
            const html = `Hi ${username},<br/>
            Please Click on the link to verify your email.<br/>
            <a href="${verifyLink}">Click here to verify</a><br/>
            Or open this in a browser: ${verifyLink}.`;

            // send email
            await sendEmail({
                to: email,
                subject: 'Shard.chat: Confirm Your Email',
                text,
                html,
            });

            logger.debug('email valudation sent to:', email);
        }

        logger.info('created user: ', user);
        res.status(201).send({message: 'Please validate your email!'});
    }));
};
