'use strict';
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gulpify = require('gulp-browserify');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var del = require('del');

require('colors')

var config;
var configFile = path.join(__dirname, 'config.json');
var isProduction = process.env.NODE_ENV === 'production';
if(!fs.existsSync(configFile)) {
  console.log('A config.json file is required to proper assign server host and port settings for production and development deployments.\n'.white.inverse);
  config = {
    host: 'localhost',
    port: 8001
  };
}
else {
  config = require(configFile)[isProduction ? 'prod' : 'dev'];
}

var serviceHost = config.host;
var servicePort = config.port;

var srcdir = path.join(__dirname, 'client');
var destdir = path.join(__dirname, 'app', 'public');

gulp.task('browserify', ['clean'], function() {
  var p = gulp.src(path.join(srcdir, 'script', 'floodpi-chart.js'), {read:false})
              .pipe(gulpify());
  var q = gulp.src(path.join(srcdir, 'script', 'floodpi-time-formatter.js'), {read:false})
              .pipe(gulpify());
              
  p.pipe(replace(/@serviceHost/, serviceHost));
  p.pipe(replace(/@servicePort/, servicePort));

  if(isProduction) {
    p.pipe(uglify());
    q.pipe(uglify());
  }

  p.pipe(gulp.dest(path.join(destdir, 'script')));
  q.pipe(gulp.dest(path.join(destdir, 'script')));
});

gulp.task('copy', ['clean'], function() {
  gulp.src([
      path.join(srcdir, 'lib', 'flotr2.min.js')
      ])
      .pipe(gulp.dest(path.join(destdir, 'lib')));

  gulp.src(path.join(srcdir, 'css', 'floodpi.css'))
      .pipe(minifycss())
      .pipe(gulp.dest(path.join(destdir, 'css')));

  gulp.src([
      path.join(srcdir, 'css', 'reset.css')
      ])
      .pipe(gulp.dest(path.join(destdir, 'css')));
});

gulp.task('clean', function(cb) {
  del([destdir], cb);
});

gulp.task('default', ['copy', 'browserify']);