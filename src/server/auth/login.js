import passport from 'passport';

export default (app) => {
    app.post('/api/login', passport.authenticate('local-login'), (req, res) => {
        res.send({user: req.user});
    });
};
