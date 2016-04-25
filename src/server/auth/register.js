import passport from 'passport';
import logger from '../util/logger';
import {User} from '../db';
import hash from '../util/hash';

export default (app) => {
    app.post('/api/register', async (req, res) => {
        const {username, password: plainPassword} = req.body;
        const password = hash(plainPassword);
        logger.info('registering:', username);

        // save
        const user = new User({username, password});
        try {
            await user.save();
        } catch (err) {
            logger.error('could not register', username, 'with:', err.toString());

            if (err.errmsg && err.errmsg.includes('username_1 dup key')) {
                res.status(500).send({registerError: 'Username already taken!'});
                return;
            }

            if (err.name === 'ValidationError') {
                const registerError = Object.keys(err.errors)
                    .reduce((acc, key) => `${acc}\n${err.errors[key].message}`, '');
                res.status(500).send({registerError});
                return;
            }

            res.status(500).send({registerError: err.toString()});
            return;
        }

        logger.info('successfully registered', username);

        passport.authenticate('local')(req, res, () => res.send({user: req.user}));
    });
};
