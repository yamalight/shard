import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import logger from '../util/logger';
import {User} from '../db';
import hash from '../util/hash';

// setup serialization
passport.serializeUser((user, cb) => cb(null, user.id));
// setup deserialization
passport.deserializeUser((id, cb) => {
    User.find(id)
    .then(user => cb(null, user))
    .catch(err => cb(err));
});

// define local strategy
const loginStrategy = new LocalStrategy((username, password, done) => {
    User.findOne({username})
    .then(user => {
        if (!user || !user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect username or password.'});
        }
        return done(null, user);
    })
    .catch(err => done(err));
});
// setup local-login strategy
passport.use('local-login', loginStrategy);

// define local strategy
const registerStrategy = new LocalStrategy((username, plainPassword, done) => {
    const password = hash(plainPassword);
    // save
    const user = new User({username, password});
    user.save()
    .then(newUser => {
        logger.info('successfully registered', username);

        done(null, newUser);
    })
    .catch(err => {
        logger.error('could not register', username, 'with:', err.toString());

        if (err.errmsg && err.errmsg.includes('username_1 dup key')) {
            done({registerError: 'Username already taken!'});
            return;
        }

        if (err.name === 'ValidationError') {
            const registerError = Object.keys(err.errors)
                .reduce((acc, key) => `${acc}\n${err.errors[key].message}`, '');
            done({registerError});
            return;
        }

        done({registerError: err.toString()});
    });
});
// setup local-login strategy
passport.use('local-register', registerStrategy);
