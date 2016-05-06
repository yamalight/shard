import _ from 'lodash';
import jwt from 'jsonwebtoken';
import {User} from '../db';
import {jwtconf} from '../../../config';
import {logger, hash, asyncRequest} from '../util';

export default (app) => {
    app.post('/api/register', asyncRequest(async (req, res) => {
        const {username, password: plainPass} = req.body;
        const password = hash(plainPass);
        logger.debug('adding: ', username, password);
        // find user
        const user = await User.create({
            username,
            password,
        });

        if (!user) {
            logger.debug('unknown error while creating user during registration!');
            res.status(500).json({error: 'Error while creating user!'});
            return;
        }

        logger.debug('created user: ', user);
        // generate token
        const token = jwt.sign(user, jwtconf.secret, {expiresIn: '1d'});
        res.status(200).json({token});
    }));
};
