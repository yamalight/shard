// npm packages
import _ from 'lodash';

// our packages
import checkAuth from '../auth/checkAuth';
import * as util from '../util';
import * as config from '../../../config';
import * as db from '../db';

const {logger} = util;

export default (app) => {
    // setup all server extensions
    const currentExtensions = config.extensions.map(Ex => {
        const routeString = `/ex/${Ex.extensionName}`;
        const route = app.route(routeString).all(checkAuth);
        const wsRoute = handler => app.ws(routeString, checkAuth, handler);
        logger.debug(`setting up extensions ${Ex.extensionName} with route: "${routeString}"`);
        return new Ex({config: _.omit(config, ['extensions']), route, wsRoute, db, util});
    });

    // save to app to let other parts access them
    app.set('currentExtensions', currentExtensions);

    // log inited extensions
    logger.debug('inited extensions:', currentExtensions.map(ex => ex.constructor.name));
};
