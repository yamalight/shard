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
import logger from './util/logger';

// init app
const app = express();
// body parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
// sockets
expressWs(app);
// logging
app.use(morgan('combined', {stream: logger.stream}));
// error handling inside of express
app.use((err, req, res, next) => { // eslint-disable-line
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

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

// start server
app.listen(8080, function() {
    const host = this.address().address;
    const port = this.address().port;
    logger.info(`Shard listening at http://${host}:${port}`);
});
