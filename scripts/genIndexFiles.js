const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');

const _destFile = 'index.html';
const _sourceFile = 'examples/index.sample.html';
const targetDir = 'examples/';

const threeVersion = packageJSON.config.threeVersion;
const name = '';
const gaKey = '';
const content = packageJSON.config.gaKey;

analytics = (name, key) => {
    return `
<!-- ANALYTICS -->
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', '${key}', 'auto');
var page = '/ami/examples/${name}';
ga('send', 'pageview', page);

</script>
	`;
};

const sourceHtml = fs.readFileSync(_sourceFile, 'utf8');
fs.readdir(targetDir, (error, files) => {
    files.forEach(file => {
        if (file === '.DS_Store' || file === 'index.sample.html') {
            return;
        }

        const destFile = targetDir + file + '/' + 'index.html';
        const sourceContentHtml = fs.readFileSync(targetDir + file + '/' + file + '.html', 'utf8');

        let targetHtml = sourceHtml.replace(/##example.name##/gi, file);
        targetHtml = targetHtml.replace('##three.version##', threeVersion);
        targetHtml = targetHtml.replace('##example.content##', sourceContentHtml);

        let gaScript = '';
        if (process.env.NODE_ENV === 'production') {
            gaScript = analytics(file, gaKey);
        }

        targetHtml = targetHtml.replace('##google.analytics##', gaScript);
        fs.writeFile(destFile, targetHtml, err => {
            if (err) throw err;
            console.log('Write: ' + destFile);
        });
    });
});
