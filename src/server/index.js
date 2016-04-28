import {join} from 'path';
// express
import express from 'express';
// body parsing
import bodyParser from 'body-parser';
// sockets
import expressWs from 'express-ws';
// logging
import morgan from 'morgan';
// webpack for dev
import setupWebpack from './webpack';
// auth api
import setupAuthAPI from './auth';
// chat api
import setupChatAPI from './chat';

// logger
import {logger} from './util';

// init app
const app = express();
// logging
app.use(morgan('combined', {stream: logger.stream}));
// body parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
// sockets
expressWs(app);

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

// output all uncaught exceptions
process.on('uncaughtException', err => logger.error('uncaught exception:', err));
process.on('unhandledRejection', error => logger.error('unhandled rejection:', error));
