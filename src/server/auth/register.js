import passport from 'passport';

export default (app) => {
    app.post('/api/register', passport.authenticate('local-register'), (req, res) => {
        res.send({user: req.user});
    });
};
