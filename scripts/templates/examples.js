const packageJSON = require('../../package.json');

/**
 * Template for all examples
 */
class ExampleTemplate {
  /**
   * Constructor
   *
   * @param {*} options
   */
  constructor(options={}) {
    this.threeVersion = packageJSON.config.threeVersion;
    this.name = '';
    this.gaKey = '';
    this.content = packageJSON.config.gaKey;
  }

  scripts() {
      return (`
<!-- Tools -->
<script type="text/javascript" src="https://use.edgefonts.net/source-code-pro.js"></script>
<script type="text/javascript" src="https://cdn.rawgit.com/dataarts/dat.gui/master/build/dat.gui.min.js"></script>
<script type="text/javascript" src="https://cdn.rawgit.com/mrdoob/stats.js/master/build/stats.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.min.js"></script>

<!-- THREEJS -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/three.js/${this.threeVersion}/three.min.js"></script>
      `);
  }

  head() {
      return (`
<head>
<title>AMI - Example ${this.name}</title>

<link rel="stylesheet" type="text/css" href="${this.name}.css">
${this.scripts()}
</head>
      `);
  }

  body() {
      return (`
<body>

${this.content}

<!-- WE LOAD SCRIPT HERE SO IT IS EASY FOR DEVS TO ADD EXTERNAL SCRIPTS IN EXAMPLE -->
<script type="text/javascript" type="text/javascript" src="${this.name}.js"></script>

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
  var page = '/ami/examples/${this.name}';
  ga('send', 'pageview', page);

</script>
      `);
  }

  html() {
      return (`
<html>
${this.head()}
${this.body()}
</html>
      `);
  }
}

module.exports.ExampleTemplate = ExampleTemplate;