import jwt from 'jsonwebtoken';
import {User} from '../db';
import {jwtconf} from '../../../config';
import {logger, hash, asyncRequest} from '../util';

export default (app) => {
    app.post('/api/login', asyncRequest(async (req, res) => {
        const {username, password: plainPass} = req.body;
        const password = hash(plainPass);
        logger.info('searching for: ', username, password);
        // find user
        const users = await User.filter({username, password})
            .without(['password'])
            .limit(1)
            .run();
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
        // generate token
        const token = jwt.sign(user, jwtconf.secret, {expiresIn: '1d'});
        res.status(200).json({token});
    }));
};
