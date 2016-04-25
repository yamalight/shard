// route middleware to make sure a user is logged in
export default (req, res, next) => (req.isAuthenticated() ? next() : res.redirect('/'));
