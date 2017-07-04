const packageJSON = require('../../package.json');

/**
 * Template for lessons
 */
class LessonTemplate {
  constructor(options={}) {
    this.threeVersion = packageJSON.config.threeVersion;
    this.version = packageJSON.version;
    this.amiCDN = packageJSON.config.amiCDN;
    this.name = '';
    this.mode = 'dist';
    this.content = '';
    this.gaKey = packageJSON.config.gaKey;
  }

  scriptsAMI() {
    if (this.mode === 'dist') {
        return (`
<!-- AMI BUILD -->
<script type="text/javascript" src="../../build/ami.js"></script>
        `);
      } else {
        return (`
<!-- AMI CDN -->
<script type="text/javascript" src="${this.amiCDN}/${this.version}/ami.min.js"></script>
        `);
      }
  }

  scripts() {
      return (`
<!-- Tools -->
<script src="https://use.edgefonts.net/source-code-pro.js"></script>
<script type="text/javascript" src="https://cdn.rawgit.com/dataarts/dat.gui/master/build/dat.gui.min.js"></script>
<script type="text/javascript" src="https://cdn.rawgit.com/mrdoob/stats.js/master/build/stats.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.min.js"></script>

<!-- THREEJS -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${this.threeVersion}/three.min.js"></script>

${this.scriptsAMI()}
      `);
  }

  head() {
      return (`
<head>
<title>AMI - Lesson ${this.name}</title>

<link rel="stylesheet" type="text/css" href="demo.css">
${this.scripts()}
</head>
      `);
  }

  body() {
      return (`
<body>

${this.content}

<script type="text/javascript" src="demo.js"></script>
</body>
      `);
  }


 analytics() {
      return (`
<!-- ANALYTICS -->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', '${this.gaKey}', 'auto');
  var page = '/ami/lessons/${this.name}';
  ga('send', 'pageview', page);

</script>
      `);
  }

  demoHTML() {
      return (`
${this.content}

${this.scripts()}
${this.analytics()}
      `);
  }


  html() {
    if (this.mode !== 'demo') {
      return (`
<html>
${this.head()}
${this.body()}
</html>
      `);
    } else {
      return (`
${this.demoHTML()}
      `);
    }
  }
}

module.exports.LessonTemplate = LessonTemplate;