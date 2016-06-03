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
        logger.error('Error decoding token', e.name);
        if (e.name === 'TokenExpiredError') {
            throw new Error('Oops, looks like your authentication is expired! Please log in again.');
        }
        throw e;
    }
    logger.debug('decoded: ', decoded);
    const {id} = decoded;
    logger.debug('searching for: ', id);
    // find user
    let user;
    try {
        user = await User.get(id).run();
    } catch (e) {
        if (e.name !== 'DocumentNotFoundError') {
            throw e;
        }
    }
    if (user) {
        logger.debug('user found!', user);
        return user;
    }

    throw new Error('You are not logged in or your session is expired!');
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
        // if ws request - close socket
        if (req.upgradeReq) {
            return req.close();
        }
        // otherwise - return 401
        return res.status(401).send({error: e.message});
    }
};
