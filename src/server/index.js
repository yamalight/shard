import {join} from 'path';
// express
import express from 'express';
// body parsing
import bodyParser from 'body-parser';
// sockets
import expressWs from 'express-ws';
// logging
import morgan from 'morgan';
// config
import * as config from '../../config';
// db
import thinky from './db';
// webpack for dev
import setupWebpack from './webpack';
// auth api
import setupAuthAPI from './auth';
// team api
import setupTeamAPI from './team';
// channel api
import setupChannelAPI from './channel';
// chat api
import setupChatAPI from './chat';
// extensions subsystem
import setupExtensions from './extensions';
// updates api
import setupUpdates from './updates';

// logger
import {logger} from './util';

// init app
const app = express();
// logging
app.use(morgan('combined', {stream: logger.stream}));
// body parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
// add socket support
expressWs(app);

// setup webpack
setupWebpack(app);

// setup extensions
setupExtensions(app);

// setup auth API
setupAuthAPI(app);
// setup updates API
setupUpdates(app);
// setup team API
setupTeamAPI(app);
// setup channel API
setupChannelAPI(app);
// setup chat API
setupChatAPI(app);

// serve static content
app.use(express.static(join(__dirname, '..', 'client')));
// serve index page
app.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'client', 'index.html')));
// error handling inside of express
app.use((err, req, res, next) => { // eslint-disable-line
    logger.error('unhandled application error: ', err);
    res.status(500).send(err);
});

// log config
logger.info('starting with config:', config);

// wait for DB setup
thinky.dbReady().then(() => {
    // start server
    app.listen(8080, function() {
        const host = this.address().address;
        const port = this.address().port;
        logger.info(`Shard listening at http://${host}:${port}`);
    });
});

// output all uncaught exceptions
process.on('uncaughtException', err => logger.error('uncaught exception:', err));
process.on('unhandledRejection', error => logger.error('unhandled rejection:', error));
