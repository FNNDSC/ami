const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');

String.prototype.toProperCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const targetName = process.argv[2];
let targetMode = 'build';
if (process.argv.length > 3) {
    targetMode = process.argv[3];
}

const _destFile = 'index.html';
const _sourceFile = targetName + '/index.sample.html';
const _sourceDemoFile = targetName + '/demo.sample.html';
let targetDir = targetName + '/';
const sourceDir = targetDir;

if (process.env.NODE_ENV === 'production') {
    targetDir = 'dist/' + targetDir;
}

const threeVersion = packageJSON.config.threeVersion;
const name = packageJSON.name;
const gaKey = packageJSON.config.gaKey;

analytics = (name, key) => {
    return `<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', '${key}', 'auto');
var page = '/ami/${targetName}/${name}';
ga('send', 'pageview', page);

</script>
	`;
};

demoAmi = mode => {
    let relPath = 'ami.js';
    if (mode === 'cdn') {
        relPath = packageJSON.config.amiCDN + '/' + packageJSON.version + '/ami.min.js';
    }

    return `<script type="text/javascript" src="${relPath}"></script>`;
};

const sourceHtml = fs.readFileSync(_sourceFile, 'utf8');
fs.readdir(sourceDir, (error, files) => {
    files.forEach(file => {
        if (file === '.DS_Store' || file === 'index.sample.html' || file === 'demo.sample.html') {
            return;
        }

        let destFile = targetDir + file + '/' + 'index.html';
        const sourceContentHtml = fs.readFileSync(sourceDir + file + '/' + file + '.html', 'utf8');

        let targetHtml = sourceHtml.replace(/##template.name##/gi, targetName === 'lessons' ? 'demo' : file);
        targetHtml = targetHtml.replace('##template.target##', file);
        targetHtml = targetHtml.replace('##three.version##', threeVersion);
        targetHtml = targetHtml.replace('##template.mode##', targetName.toProperCase());
        targetHtml = targetHtml.replace('##template.content##', sourceContentHtml);
        targetHtml = targetHtml.replace('##template.ami', targetName === 'lessons' ? demoAmi(targetMode) : '');

        let gaScript = '';
        if (process.env.NODE_GA) {
            gaScript = analytics(file, gaKey);
        }

        targetHtml = targetHtml.replace('##google.analytics##', gaScript);
        fs.writeFile(destFile, targetHtml, err => {
            if (err) throw err;
            console.log('Write: ' + destFile);
        });

        if (targetName === 'lessons') {
            const sourceDemoHtml = fs.readFileSync(_sourceDemoFile, 'utf8');

            destFile = targetDir + file + '/' + 'demo.html';
            let targetHtml = sourceDemoHtml;
            targetHtml = targetHtml.replace('##three.version##', threeVersion);
            targetHtml = targetHtml.replace('##template.content##', sourceContentHtml);
            targetHtml = targetHtml.replace('##template.ami', demoAmi(targetMode));
            targetHtml = targetHtml.replace('##google.analytics##', analytics(file, gaKey));

            fs.writeFile(destFile, targetHtml, err => {
                if (err) throw err;
                console.log('Write: ' + destFile);
            });
        }
    });
});
