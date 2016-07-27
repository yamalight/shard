import jwt from 'jsonwebtoken';
import moment from 'moment';
import {User} from '../db';
import {jwtconf} from '../../../config';
import {logger, hash, asyncRequest} from '../util';

const basicAuth = {
    async authenticate({username, password: plainPass}) {
        const password = hash(plainPass);
        logger.info('basic auth - searching for: ', {username, password});
        // find user
        const users = await User.filter({username, password})
            .without(['password', 'verifyId', 'subscriptions', 'passwordReset'])
            .limit(1)
            .execute();
        const user = users.pop();
        // check if user was found
        if (!user) {
            logger.error('Incorrect username or password:', username);
            return {error: 'Incorrect username or password!'};
        }

        if (!user.isEmailValid) {
            logger.error('Email not validated for:', username);
            return {error: 'You need to validate your email first!'};
        }

        return {user};
    },
};

export default (app) => {
    const currentExtensions = app.get('currentExtensions');
    const authExtensions = currentExtensions.filter(ex => ex.type === 'auth');
    const authStrategies = authExtensions.concat([basicAuth]);

    app.post('/api/login', asyncRequest(async (req, res) => {
        const {username, remember, password: plainPass} = req.body;
        logger.info('authenticating for: ', {username, remember});

        let user = null;
        let error = null;
        for (let i = 0; i < authStrategies.length; i++) {
            const ex = authStrategies[i];
            const authRes = await ex.authenticate({username, password: plainPass});
            user = authRes.user;
            error = authRes.error;
            if (user) {
                error = null;
                break;
            }
        }
        // if ended with error - throw
        if (error) {
            res.status(401).json({error});
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
