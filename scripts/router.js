require('shelljs/global');
const fs = require('fs');

if (process.argv[2] && process.argv[3]) {
    const mode = process.argv[2];
    const target = process.argv[3];

    if (target === 'deploy') {
        const targetDir = 'dist/' + mode;
        fs.readdir(targetDir, function(e, files) {
            // each lesson directory
            files.forEach(function(file) {
                if (file === '.DS_Store' || file === 'index.sample.html' || file === 'demo.sample.html') {
                    return;
                }

                exec(`npm run example ${file} deploy`);
            });
        });
    } else {
        const file = mode === 'lessons' ? 'demo.js' : `${target}.js`;
        let directory = `${mode}/${target}`;
        let name = target;

        let buildAmi = '';
        let generateIndexFiles = '';
        // also watch AMI if lessons mode
        if (mode === 'lessons') {
            buildAmi = ' & npm run dev:ami && npm run build:clean:hot';
            name = 'demo';
        }

        if (
            !fs.existsSync(directory + '/index.html') ||
            (mode === 'lessons' && !fs.existsSync(directory + '/demo.html'))
        ) {
            generateIndexFiles = 'npm run gen:index:' + mode + ' &&';
        }

        let webpackCmd =
            'webpack-dev-server --config webpack.config.build.js --hot --inline --progress --open' + buildAmi;

        if (process.argv.length >= 4 && process.argv[4] === 'deploy') {
            webpackCmd = 'cross-env NODE_ENV=production webpack --config webpack.config.build.js --progress --colors';
            directory = 'dist/' + directory;
        }

        exec(`${generateIndexFiles} NODE_WEBPACK_TARGET=${directory} NODE_WEBPACK_NAME=${name} ${webpackCmd}`);
    }
} else {
    console.warn('router.js requires 2 arguments. Make sure the following arguments are correct:');
    process.argv.forEach(function(val, index, array) {
        console.warn(index + ': ' + val);
    });
}
