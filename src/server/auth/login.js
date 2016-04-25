import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {User} from '../db';

const strategy = new LocalStrategy((username, password, done) => {
    User.findOne({username})
    .then(user => {
        if (!user || !user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect username or password.'});
        }
        return done(null, user);
    })
    .catch(err => done(err));
});
passport.use(strategy);

export default (app) => {
    app.post('/api/login', passport.authenticate('local'), (req, res) => {
        res.send({user: req.user});
    });
};
