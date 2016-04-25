import {join} from 'path';
// express
import express from 'express';
// body parsing
import bodyParser from 'body-parser';
// sockets
import expressWs from 'express-ws';
// auth
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
// logging
import morgan from 'morgan';
// webpack for dev
import setupWebpack from './webpack';
// auth api
import setupAuthAPI from './auth';
// chat api
import setupChatAPI from './chat';
// config
import {auth} from '../../config';

// logger
import logger from './util/logger';

// init app
const app = express();
// logging
app.use(morgan('combined', {stream: logger.stream}));
// session & cookies
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    ...auth.session,
}));
// body parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
// sockets
expressWs(app);
// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// setup webpack
setupWebpack(app);

// setup auth API
setupAuthAPI(app);
// setup chat API
setupChatAPI(app);

// serve static content
app.use(express.static(join(__dirname, '..', 'client')));
// serve index page
app.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'client', 'index.html')));
// error handling inside of express
app.use((err, req, res, next) => { // eslint-disable-line
    logger.error('application error: ', err);
    res.status(500).send(err);
});

// start server
app.listen(8080, function() {
    const host = this.address().address;
    const port = this.address().port;
    logger.info(`Shard listening at http://${host}:${port}`);
});
