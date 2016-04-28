import _ from 'lodash';
import jwt from 'jsonwebtoken';
import {User} from '../db';
import {jwtconf} from '../../../config';
import {logger, hash, asyncRequest} from '../util';

export default (app) => {
    app.post('/api/login', asyncRequest(async (req, res) => {
        const {email, password: plainPass} = req.body;
        const password = hash(plainPass);
        logger.debug('searching for: ', email, password);
        // find user
        const user = await User.findOne({
            email,
            password,
        });
        // check if user was found
        if (!user) {
            res.status(401).json({error: 'Incorrect email or password!'});
            return;
        }
        const userObj = _.omit(user.toObject(), ['password', '__v']);
        logger.debug('got user: ', userObj);
        // generate token
        const token = jwt.sign(userObj, jwtconf.secret, {expiresIn: '1d'});
        res.status(200).json({token});
    }));
};
