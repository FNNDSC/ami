require('shelljs/global');
const fs = require('fs');

if (process.argv[2] && process.argv[3]) {
    const mode = process.argv[2];
    const target = process.argv[3];
    const file = mode === 'lessons' ? 'demo.js' : `${target}.js`;
    const directory = `${mode}/${target}`;
    let name = target;

    let buildAmi = '';
    let generateIndexFiles = '';
    // also watch AMI if lessons mode
    if (mode === 'lessons') {
        buildAmi = 'npm run dev:ami && npm run build:clean:hot';
        name = 'demo';
    }

    if (!fs.existsSync(directory + '/index.html') || (mode === 'lessons' && !fs.existsSync(directory + '/demo.html'))) {
        generateIndexFiles = 'npm run gen:index:' + mode + ' &&';
    }

    exec(
        `${generateIndexFiles} NODE_WEBPACK_TARGET=${directory}/ NODE_WEBPACK_NAME=${name} webpack-dev-server --config webpack.config.build.js --hot --inline --progress --open & ${buildAmi}`
    );
} else {
    console.warn('router.js requires 2 arguments. Make sure the following arguments are correct:');
    process.argv.forEach(function(val, index, array) {
        console.warn(index + ': ' + val);
    });
}
