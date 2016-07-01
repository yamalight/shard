import jwt from 'jsonwebtoken';
import moment from 'moment';
import {User} from '../db';
import {jwtconf} from '../../../config';
import {logger, hash, asyncRequest} from '../util';

export default (app) => {
    app.post('/api/login', asyncRequest(async (req, res) => {
        const {username, remember, password: plainPass} = req.body;
        const password = hash(plainPass);
        logger.info('searching for: ', {username, password, remember});
        // find user
        const users = await User.filter({username, password})
            .without(['password', 'verifyId', 'subscriptions', 'passwordReset'])
            .limit(1)
            .execute();
        const user = users.pop();
        // check if user was found
        if (!user) {
            logger.error('Incorrect username or password:', username);
            res.status(401).json({error: 'Incorrect username or password!'});
            return;
        }

        if (!user.isEmailValid) {
            logger.error('Email not validated for:', username);
            res.status(401).json({error: 'You need to validate your email first!'});
            return;
        }

        logger.info('got user: ', user);
        const expireDays = remember ? 90 : 1;
        const expires = moment().add(expireDays, 'd').toDate();
        // generate token
        const token = jwt.sign(user, jwtconf.secret, {expiresIn: `${expireDays}d`});
        // expiration date
        logger.debug('expires:', expires);
        // set cookie
        res.cookie('id_token', token, {expires, httpOnly: true});
        // send token
        res.status(200).json({token});
    }));
};
