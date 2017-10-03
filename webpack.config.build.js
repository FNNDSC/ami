var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: ['three', 'babel-polyfill', './src/ami.js'],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: debug ? 'ami.js' : 'ami.min.js',
        library: 'ami',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                /* options: {
                    presets: [
                        [
                            'es2015',
                            'env',
                            {
                                targets: {
                                    node: '6.9.0'
                                },
                                loose: true,
                                //modules: false,
                                useBuiltIns: true,
                                debug: false
                            }
                        ]
                    ],
                    plugins: ['transform-runtime', 'add-module-exports']
                },*/
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
