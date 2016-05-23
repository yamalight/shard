import jwt from 'jsonwebtoken';
import {logger} from '../util';
import {User} from '../db';
import {jwtconf} from '../../../config';

// token from request
export const requestToToken = (req) => req.body.token || req.query.token || req.headers['x-access-token'];

export const checkStringToken = async (token) => {
    logger.debug('checking token: ', token);
    if (!token) {
        logger.error('no auth token provided');
        throw new Error('No auth token provided!');
    }

    let decoded;
    try {
        // FIXME ignoreExpiration
        decoded = jwt.verify(token, jwtconf.secret, {ignoreExpiration: process.env.NODE_ENV !== 'production'});
    } catch (e) {
        logger.error('Error decoding token', e);
        throw e;
    }
    logger.debug('decoded: ', decoded);
    const {id} = decoded;
    logger.debug('searching for: ', id);
    // find user
    const user = await User.get(id).run();
    if (user) {
        logger.debug('user found!', user);
        return user;
    }

    throw new Error('Not logged in!');
};

// action
export default async (req, res, next) => {
    const reqToCheck = req.upgradeReq || req;
    const token = requestToToken(reqToCheck);
    try {
        const user = await checkStringToken(token);
        logger.debug('user found!', user);
        req.userInfo = user; // eslint-disable-line
        return next();
    } catch (e) {
        return next(e);
    }
};
