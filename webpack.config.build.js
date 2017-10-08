var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var config = {
    entry: ['babel-polyfill', './src/ami.js'],
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: debug ? 'ami.js' : 'ami.min.js'
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
}

if (process.env.NODE_WEBPACK_LIBMOD) {
    config.output.library = 'AMI';
    config.output.libraryTarget = process.env.NODE_WEBPACK_LIBMOD;
    config.output.umdNamedDefine = true;
}
if (process.env.NODE_WEBPACK_ANALIZE) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
