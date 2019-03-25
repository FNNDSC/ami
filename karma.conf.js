('use strict');

const path = require('path');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(karma) {
  karma.set({
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.min.js',
      `https://unpkg.com/three@latest/build/three.min.js`,
      // ,
      // 'specs/core/*.spec.*s',
      'specs/loaders/loaders2.spec.*s',
      { pattern: 'data/**/*', included: false, watched: false, served: true },
    ],

    reporters: ['spec'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'specs/**/*.spec.*s': ['webpack'],
    },

    browsers: ['ChromeHeadless'],
    // You have to add the mime type for Typescript files. Otherwise, Chrome won't run these files.
    mime: {
      'text/x-typescript': ['ts']
    },

    // web server port
    // port: 9876,
    // colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: karma.LOG_WARN,

    autoWatch: true,
    // singleRun: true,
    colors: true,
    webpack: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.scss', '.json'],
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: [/node_modules/, /external/],
          },
          {
            test: /\.worker\.ts$/,
            use: {
            loader: 'worker-loader',
          }
          },
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: [/external/],
          },
        ],
      },
      mode: 'development',
      node: {
        fs: 'empty',
      },
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only',
    },
  });
};
