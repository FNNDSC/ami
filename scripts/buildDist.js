const fs = require('fs');

var copy = (srcDir, dstDir) => {
    var results = [];
    var list = fs.readdirSync(srcDir);
    var src, dst;
    list.forEach(file => {
        if (
            file === '.DS_Store' ||
            file === 'index.sample.html' ||
            file === 'demo.sample.html' ||
            file === 'index.html'
        ) {
            return;
        }

        src = srcDir + '/' + file;
        dst = dstDir + '/' + file;
        console.log(src);
        var stat = fs.statSync(src);
        if (stat && stat.isDirectory()) {
            try {
                console.log('creating dir: ' + dst);
                fs.mkdirSync(dst);
            } catch (e) {
                console.log('directory already exists: ' + dst, e);
            }
            results = results.concat(copy(src, dst));
        } else {
            try {
                console.log('copying file: ' + dst);
                fs.writeFileSync(dst, fs.readFileSync(src));
            } catch (e) {
                console.log("could't copy file: " + dst, e);
            }
            results.push(src);
        }
    });
    return results;
};

fs.mkdirSync('dist/examples');
copy('examples', 'dist/examples');
fs.createReadStream('index.html').pipe(fs.createWriteStream('dist/index.html'));
