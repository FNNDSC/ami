const debug = process.env.NODE_ENV !== 'production';
const mode = process.env.NODE_ENV !== 'production' ? 'development' : 'production';
const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WatchLiveReloadPlugin = require('webpack-watch-livereload-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const config = {
    entry: ['./src/ami.js'],
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: debug ? 'ami.js' : 'ami.min.js',
        library: 'AMI',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    mode: 'production',
    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        extensions: ['.js', '.jsx', '.css', '.html', '.scss', '.json'],
        alias: {
            base: path.resolve(__dirname, 'src'),
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
        ],
    },
    node: {
        fs: 'empty',
    },
    optimization: {
        minimize: true,
        sideEffects: false,
        minimizer: [
            new UglifyJSPlugin({
                      parallel: true,
                      uglifyOptions: {
                          compress: {
                              warnings: true,
                          },
                          minimize: true,
                      },
                  }),
          ],
      },
    plugins: debug
        ? []
        : [
              new webpack.DefinePlugin({
                  'process.env': {
                      NODE_ENV: JSON.stringify('production'),
                  },
              }),
            //   new UglifyJSPlugin({
            //       parallel: true,
            //       uglifyOptions: {
            //           compress: {
            //               warnings: false,
            //           },
            //           minimize: true,
            //       },
            //   }),
          ],
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
    if (debug && workPath.indexOf('/dist/') === -1) {
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
} else if (!debug) {
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
