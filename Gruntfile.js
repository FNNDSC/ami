'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
var redirection = function (connect) {
  return connect().use(require('connect-redirection')());
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var vjsConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    vjs: vjsConfig,
    watch: {
      options: {
        nospawn: true,
        livereload: { liveCSS: false }
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          '<%= vjs.app %>/*.html',
          '{.tmp,<%= vjs.app %>}/**/*.js',
          '{.tmp,<%= vjs.app %>}/**/*.css'
        ]
      },
      js: {
        files: ['<%= vjs.app %>/**/*.js'],
        tasks: ['jshint', 'jsbeautifier']
      },
      styles: {
        files: ['<%= vjs.app %>/**/*.css'],
        tasks: ['copy:styles', 'autoprefixer:server']
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      server: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '**/*.css',
          dest: '.tmp'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= vjs.dist %>',
          src: ['**/*.css'],
          dest: '<%= vjs.dist %>'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, vjsConfig.app),
              redirection(connect),
              function(req, res, next) {
                res.redirect('/');
              }
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, vjsConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', '<%= vjs.dist %>/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: ['<%= vjs.app %>/**/*.js']
    },
    jsbeautifier : {
      files: ["<%= vjs.app %>/**/*.js"],
      options: {
          config: ".jshintrc"
      }
    },
    useminPrepare: {
      html: '<%= vjs.app %>/index.html',
      options: {
        dest: '<%= vjs.dist %>'
      }
    },
    usemin: {
      html: ['<%= vjs.dist %>/**/*.html'],
      css: ['<%= vjs.dist %>/**/*.css'],
      options: {
        dirs: ['<%= vjs.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= vjs.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= vjs.dist %>/images'
        }]
      }
    },
    minifyHtml: {
      options: {
        quotes: true,
        empty: true
      },
      app: {
        files: [{
          expand: true,
          cwd: '<%= vjs.dist %>',
          src: '*.html',
          dest: '<%= vjs.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= vjs.app %>',
          dest: '<%= vjs.dist %>',
          src: [
            '*.{ico,txt,png}',
            '.htaccess',
            '*.html',
            'elements/**',
            '!elements/**/*.scss',
            'images/{,*/}*.{webp,gif}',
            'bower_components/**',
            'worker.js'
          ]
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: '<%= vjs.app %>',
          dest: '.tmp',
          src: ['{styles,elements}/{,*/}*.css']
        }]
      }
    },
    concat: {
      dist: {}
    },
    min: {
      dist: {}
    },
    uglify: {
      dist: {}
    },
    cssmin: {
      dist: {}
    }
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'copy:styles',
      'autoprefixer:server',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy',
    'useminPrepare',
    'imagemin',
    'concat',
    'autoprefixer',
    'uglify',
    'usemin',
    'minifyHtml'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'jsbeautifier',
    // 'test'
    'build'
  ]);
};