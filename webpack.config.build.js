const mode = process.env.NODE_ENV !== 'production' ? 'development' : 'production' ;

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WatchLiveReloadPlugin = require('webpack-watch-livereload-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const config = {
    entry: ['./src/ami.ts'],
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: mode === 'development' ? 'ami.js' : 'ami.min.js',
        library: 'AMI',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    mode,
    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.scss', '.json'],
        alias: {
            base: path.resolve(__dirname, 'src'),
            pako: path.resolve(__dirname, 'node_modules', 'pako'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [path.resolve(__dirname, 'src')],
                exclude: [/node_modules/, 'external/**/*'],
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: ['external/**/*'],
            },
        ],
    },
    node: {
        fs: 'empty',
    },
    plugins: [],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
            parallel: true,
            }),
        ],
    },
};

if (process.env.NODE_WEBPACK_TARGET) {
    config.entry = [path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET, process.env.NODE_WEBPACK_NAME + '.js')];

    config.resolve.modules.push(path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET));
    config.output.path = path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET);
    config.output.filename = process.env.NODE_WEBPACK_NAME + '.js';
    config.output.library = undefined;
    config.output.libraryTarget = undefined;
    config.output.umdNamedDefine = undefined;

    config.module.rules
        .find((r) => r.loader === 'babel-loader')
        .include.push(path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET));

    const workPath = path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET);
    if (mode === 'development' && workPath.indexOf('/dist/') === -1) {
        config.plugins.push(
            new WatchLiveReloadPlugin({
                files: [path.resolve(__dirname, 'build') + '/*.js', workPath + '/**/*.html', workPath + '/**/*.css'],
            })
        );
    }

    const dataPath = path.resolve(__dirname, 'data');

    config.devServer = {
        contentBase: [dataPath, workPath, path.resolve(__dirname, 'build')],
        historyApiFallback: true,
    };
} else if (mode === 'production') {
    config.plugins.push(
        new CompressionPlugin({
            algorithm: 'gzip',
        })
    );
}

if (process.env.NODE_WEBPACK_ANALYZE) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
