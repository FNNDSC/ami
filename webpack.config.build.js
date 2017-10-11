var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var WatchLiveReloadPlugin = require('webpack-watch-livereload-plugin');

var config = {
    entry: ['babel-polyfill', './src/ami.js'],
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: debug ? 'ami.js' : 'ami.min.js',
        library: 'AMI',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    //externals: ['three'],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [path.resolve(__dirname, 'src')],
                exclude: [/node_modules/, 'external/**/*']
            }
        ]
    },
    plugins: debug
        ? []
        : [
              new webpack.DefinePlugin({
                  'process.env': {
                      NODE_ENV: JSON.stringify('production')
                  }
              }),
              new UglifyJSPlugin({
                  parallel: true,
                  compress: {
                      warnings: false
                  },
                  minimize: true,
                  sourcemap: false
              })
          ]
};

if (process.env.NODE_WEBPACK_TARGET) {
    config.entry = [
        //'three',
        //   'babel-polyfill',
        path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET, process.env.NODE_WEBPACK_NAME + '.js')
    ];
    config.output.path = path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET);
    config.output.filename = process.env.NODE_WEBPACK_NAME + '.js';
    config.output.library = undefined;
    config.output.libraryTarget = undefined;
    config.output.umdNamedDefine = undefined;

    if (debug) {
        config.plugins.push(new WatchLiveReloadPlugin({ files: ['./lib/*.js'] }));
    }

    config.devServer = {
        contentBase: [path.resolve(__dirname, process.env.NODE_WEBPACK_TARGET), path.resolve(__dirname, 'lib')],
        historyApiFallback: true
    };
}

if (process.env.NODE_WEBPACK_ANALIZE) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
