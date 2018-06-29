const packageJSON = require('./package.json');

('use strict');

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(karma) {
    karma.set({
        // frameworks to use
        frameworks: ['jasmine', 'sinon'],

        // list of files / patterns to load in the browser
        files: [
            'https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.min.js',
            `https://cdnjs.cloudflare.com/ajax/libs/three.js/${packageJSON.config.threeVersion}/three.js`,
            // ,
            // 'src/core/*.spec.js',
            'specs/**/*.spec.js',
            { pattern: 'data/**/*', included: false, watched: false, served: true }
        ],

        reporters: ['spec'],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'specs/**/*.spec.js': ['webpack']
            // 'src/core/*.spec.js': ['browserify']
        },

        browsers: ['ChromeHeadless'],

        // web server port
        // port: 9876,
        // colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: karma.LOG_WARN,

        autoWatch: false,
        singleRun: true,
        colors: true,

        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: [/node_modules/, 'external/**/*']
                    }
                ]
            }
        },
        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        }
    });
};
