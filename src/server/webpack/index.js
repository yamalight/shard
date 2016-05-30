import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import {logger} from '../util';
import config from './webpack.config.js';

const isProduction = process.env.NODE_ENV === 'production';

// define node_env
config.plugins = [
    new webpack.DefinePlugin({
        'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)},
    }),
];

// if not prod - enable hot reload
if (!isProduction) {
    logger.info('not production - adding hot reload plugins');
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new webpack.NoErrorsPlugin());
    // override entry for hotload
    config.entry = [
        'webpack-hot-middleware/client',
        config.entry,
    ];
} else {
    logger.info('production - adding optimization plugins');
    config.devtool = 'cheap-source-map';
    config.debug = false;
    // extract styles into file
    config.module.loaders = config.module.loaders
    .map(loader => {
        const cssIndex = loader.loaders ? loader.loaders.findIndex(it => it.indexOf('css') !== -1) : -1;
        if (cssIndex === -1) {
            return loader;
        }

        loader.loaders[cssIndex] = loader.loaders[cssIndex].replace('css?', 'css?minimize&'); // eslint-disable-line
        loader.loaders[cssIndex] = loader.loaders[cssIndex].replace(/^css$/, 'css?minimize'); // eslint-disable-line
        return loader;
    })
    .map(loader => {
        const style = loader.loaders ? loader.loaders.findIndex(it => it.indexOf('style') !== -1) : -1;
        if (style === -1) {
            return loader;
        }

        loader.loader = ExtractTextPlugin.extract(loader.loaders.slice(1).join('!')); // eslint-disable-line
        delete loader.loaders; // eslint-disable-line
        return loader;
    });
    // add optimization plugins
    config.plugins.push(new ExtractTextPlugin('main.css'));
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },
    }));
    config.plugins.push(new LodashModuleReplacementPlugin());
}

// returns a Compiler instance
const compiler = webpack(config);

// stats output config
const statsConf = {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false,
};

// create express
export default (app) => {
    // only user middleware while in dev
    if (!isProduction) {
        app.use(webpackMiddleware(compiler, {
            publicPath: config.output.publicPath,
            contentBase: 'src',
            stats: statsConf,
        }));
        app.use(webpackHotMiddleware(compiler));
        return;
    }

    compiler.run((err, stats) => {
        if (err) {
            logger.error('Webpack error:', err);
            return;
        }

        logger.info('webpack done!', stats.toJson({
            ...statsConf,
            assets: false,
        }));
    });
};
