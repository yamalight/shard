const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    debug: true,
    context: path.resolve(__dirname, '..', '..', 'client'),
    entry: {
        vendor: [
            'highlight.js',
            'immutable',
            'lodash',
            'lodash',
            'markdown-it',
            'markdown-it-container',
            'markdown-it-emoji',
            'markdown-it-fontawesome',
            'markdown-it-task-lists',
            'moment',
            'mousetrap',
            'react',
            'react-addons-shallow-compare',
            'react-dock',
            'react-dom',
            'react-portal',
            'react-router',
            'react-textarea-autosize',
            'rx',
            'rx-dom',
            'rxstate',
            'spark-md5',
        ],
        app: path.join(__dirname, '..', '..', 'client', 'index.js'),
    },
    output: {
        path: path.resolve(__dirname, '..', '..', 'client', 'dist'),
        publicPath: '/dist/',
        filename: '[name].min.js',
    },
    resolve: {
        root: path.resolve(__dirname, '..', '..', '..'),
        extensions: ['', '.js', '.jsx', '.json'],
        modulesDirectories: ['node_modules'],
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        module: 'empty',
    },
    module: {
        noParse: [/autoit.js/],
        loaders: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loaders: [
                    'style',
                    'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
                ],
            },
            {
                test: /node_modules\/.+\.css$/,
                loaders: ['style', 'css'],
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass'],
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react', 'stage-1'],
                    plugins: ['lodash', 'transform-runtime'],
                    env: {
                        development: {
                            presets: ['react-hmre'],
                        },
                        production: {
                            presets: ['react-optimize'],
                        },
                    },
                },
            },
            {
                test: /\.md$/,
                loader: 'raw',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.woff\d?(\?.+)?$/,
                loader: 'url?limit=10000&minetype=application/font-woff',
            },
            {
                test: /\.ttf(\?.+)?$/,
                loader: 'url?limit=10000&minetype=application/octet-stream',
            },
            {
                test: /\.eot(\?.+)?$/,
                loader: 'url?limit=10000',
            },
            {
                test: /\.svg(\?.+)?$/,
                loader: 'url?limit=10000&minetype=image/svg+xml',
            },
            {
                test: /\.png$/,
                loader: 'url?limit=10000&mimetype=image/png',
            },
            {
                test: /\.gif$/,
                loader: 'url?limit=10000&mimetype=image/gif',
            },
        ],
    },
};
