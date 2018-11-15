const fs = require('fs');
const packageJSON = require('../package.json');

String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const targetName = process.argv[2];
const _sourceFile = targetName + '/index.sample.html';
let targetDir = targetName + '/';
const sourceDir = targetDir;

if (process.env.NODE_ENV === 'production') {
  targetDir = 'dist/' + targetDir;
}

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

    let targetHtml = sourceHtml.replace(/##template.name##/gi, file);
    targetHtml = targetHtml.replace('##template.target##', file);
    targetHtml = targetHtml.replace('##template.content##', sourceContentHtml);
    targetHtml = targetHtml.replace('##template.ami', '');

    let gaScript = '';
    if (process.env.NODE_GA) {
      gaScript = analytics(file, gaKey);
    }

    targetHtml = targetHtml.replace('##google.analytics##', gaScript);
    fs.writeFile(destFile, targetHtml, err => {
      if (err) throw err;
      console.log('Write: ' + destFile);
    });
  });
});
