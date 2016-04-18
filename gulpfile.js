'use strict';

// include gulp and tools
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var exec        = require('child_process').exec;
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var del         = require('del');
var runSequence = require('run-sequence');
var es          = require('event-stream');
var browserify  = require('browserify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var sourcemaps  = require('gulp-sourcemaps');
var gutil       = require('gulp-util');
var glslify     = require('glslify');
var babelify    = require('babelify');
//var minifyify   = require('minifyify');
//var uglify      = require('gulp-uglify');
var globby      = require('globby');
var argv        = require('yargs').argv;
var karma       = require('karma');
var eslint      = require('gulp-eslint');
var watchify    = require('watchify');
//var rename      = require('gulp-rename');

var VERSION = '0.0.3';

var target = 'examples/**/*.js';

// Clean output directories
gulp.task('clean', del.bind(null, ['gh-pages', '.tmp']));

// Copy (data) task
// Copy task
gulp.task('copy', function() {
  var dcm = gulp.src(['data/dicom/**/*'])   // dicom data used in demos
    .pipe(gulp.dest('gh-pages/data/dicom'));

  var nii = gulp.src(['data/nifti/**/*'])   // nifti data used in demos
    .pipe(gulp.dest('gh-pages/data/nifti'));

  var nrrd = gulp.src(['data/nrrd/**/*'])   // nifti data used in demos
    .pipe(gulp.dest('gh-pages/data/nrrd'));

  var vtk = gulp.src(['data/vtk/**/*'])   // nifti data used in demos
    .pipe(gulp.dest('gh-pages/data/vtk'));

  var assets = gulp.src(['favicon.ico'])  // fav icon for github page
    .pipe(gulp.dest('gh-pages'));

  return es.merge(dcm, assets)
    .pipe($.size({title: 'copy'}));
});

// HTML task
gulp.task('html', function() {
  return gulp.src([
        '**/*.html',
        '!bower_components{,/**}',
        '!node_modules{,/**}',
        '!test{,/**}',
        '!gh-pages{,/**}',
        '!deprecated{,/**}'
    ])
    .pipe(gulp.dest('gh-pages'))
    .pipe($.size({title: 'html'}));
});

// CSS task
gulp.task('css', function() {
  return gulp.src([
        'examples/**/*.css'
    ])
    .pipe(gulp.dest('gh-pages/examples'))
    .pipe($.size({title: 'css'}));
});

// JS examples task
gulp.task('js-examples', function(cb) {
  // process files of interest
  var keys = Object.keys(argv);
  if(keys.length === 3){
    target = 'examples/' +  Object.keys(argv)[1] + '/*.js';
  }

  globby([target], function(err, files) {
    if (err) {
      cb(err);
    }
    var tasks = files.map(function(entry) {
          // to remove /app layer
          var index = entry.indexOf('/');
          return browserify(
              {entries: [entry],
                debug: true
              })
            .transform(babelify)
            .transform(glslify)
            .bundle()
            .pipe(source(entry.substring(index + 1)))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
                .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('gh-pages/examples')); 
        });

    // create a merged stream
    es.merge(tasks).on('end', cb);
  });
});

gulp.task('js-examples-watchify', function(cb) {
  // process files of interest
  var keys = Object.keys(argv);
  if(keys.length === 3){
    target = 'examples/' +  Object.keys(argv)[1] + '/*.js';
  }
  globby([target], function(err, files) {
    if (err) {
      cb(err);
    }
    var tasks = files.map(function(entry) {
      // to remove /app layer
      var index = entry.indexOf('/');
          
      var b = browserify(
        {entries: [entry],
          debug: true,
          cache: {},
          packageCache: {},
          plugin: [watchify]
          })
        .transform(babelify)
        .transform(glslify);

      b.on('update', bundle);
      b.on('log', gutil.log);

      function bundle() {
            return b.bundle()
            .pipe(source(entry.substring(index + 1)))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
                .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('gh-pages/examples'))
            .pipe(reload({stream: true, once: true}));;
          }

      return bundle();
    });
    // create a merged stream
    es.merge(tasks).on('end', cb);
  });
});

gulp.task('build', function(cb) {
  // process files of interest
  globby(['src/ami.js'], function(err, files) {
    if (err) {
      cb(err);
    }

    var tasks = files.map(function(entry) {
          // to remove /app layer
          var index = entry.indexOf('/');
          return browserify(
              {entries: [entry],
                debug: true,
                standalone: 'AMI'
              })
            //.plugin('minifyify', {
            //    output: 'dist/ami.js.map',
            //    map: 'ami.js.map'
            //  })
            .transform(babelify, {
              presets: ['es2015'],
              ignore: ['external/**/*']})
            .transform(glslify)
            .bundle()
            .pipe(source(entry.substring(index + 1)))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            //    .pipe(uglify())
                .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            //.pipe(rename('ami.min.js'))
            .pipe(gulp.dest('dist')); 
        });

    // create a merged stream
    es.merge(tasks).on('end', cb);
  });
});


// Documentation task with JSDoc
gulp.task('doc', function(done) {
  var cmd = '';
  if (process.platform === 'win32') {
    cmd = 'node_modules\\.bin\\jsdoc -p -r -R README.md -c jsdoc.conf -t node_modules\\minami -d gh-pages\\doc src';
  }else {
    cmd = 'node_modules/.bin/jsdoc -p -r -R README.md -c jsdoc.conf -t node_modules/minami -d gh-pages/doc src';
  }
  exec(cmd, function(e, stdout) {
    gutil.log(stdout);
    done();
  });
});

// Test task with Karma+Jasmine
gulp.task('test', function(done) {
  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    reporters: ['spec'],
    singleRun: true,
    autoWatch: false
  }, done);

  server.start();
});

// Lint js
gulp.task('lint', function() {
  return gulp.src([
      'src/**/*.js',
      'examples/**/*.js',
      '!src/controls/**/*',
      '!src/parsers/jpx.js',
      '!src/parsers/jpeg.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format());
    //.pipe(eslint.failAfterError());
});

// no test anymore... too slow...
gulp.task('js-watch', ['lint']);
gulp.task('html-watch', ['html'], reload);
gulp.task('css-watch', ['css'], reload);

gulp.task('browsersync', function(){
    // gh-pages mode, no route to web components
  browserSync({
    server: {
      baseDir: ['gh-pages']
    }
  });

  gulp.watch(['src/**/*.js', 'examples/**/*.js'], ['js-watch']);
  gulp.watch(['index.html', 'examples/**/*.html'], ['html-watch']);
  gulp.watch(['examples/**/*.css'], ['css-watch']);
});

gulp.task('lessons', function(){
  var keys = Object.keys(argv);
  var lesson = '';
  if(keys.length === 3){
    lesson = Object.keys(argv)[1];
  }

    // gh-pages mode, no route to web components
  browserSync({
    server: {
      baseDir: ['./lessons/' + lesson, '.']
    }
  });

  gulp.watch(['src/**/*.js', 'lessons/**/*.js'], ['js-watch', browserSync.reload]);
  gulp.watch(['src/**/*.js'], ['build', browserSync.reload]);
  gulp.watch(['lessons/**/*.html'], ['html-watch', browserSync.reload]);
  gulp.watch(['lessons/**/*.css'], ['css-watch', browserSync.reload]);
});

gulp.task('build-deploy', function(cb) {
  runSequence(
    'default',
    'deploy-gh-pages',
    cb);
});

// Deploy to GitHub pages gh-pages branch
gulp.task('deploy-gh-pages', function() {
  return gulp.src('gh-pages/**/*')
    .pipe($.ghPages());
});

// examples task for devs
gulp.task('examples', ['default'], function(cb) {
  runSequence(
    // takes care
    ['browsersync','js-examples-watchify'],
    cb);
});

// Gh-pages task is the default task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'lint',
    //'test',
    'copy', // copy the data over!
    ['html', 'css', 'js-examples'],
    'doc',
    cb);
});
