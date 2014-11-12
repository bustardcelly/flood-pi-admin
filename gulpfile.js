'use strict';
var path = require('path');
var gulp = require('gulp');
var gulpify = require('gulp-browserify');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var del = require('del');

var isProduction = process.env.NODE_ENV === 'production';
var serviceHost = isProduction ? '54.173.112.166' : 'localhost';
var servicePort = isProduction ? '8001' : '8001';

var srcdir = path.join(__dirname, 'client');
var destdir = path.join(__dirname, 'app', 'public');

gulp.task('browserify', ['clean'], function() {
  var p = gulp.src(path.join(srcdir, 'script', 'floodpi-chart.js'), {read:false})
              .pipe(gulpify());
              
  p.pipe(replace(/@serviceHost/, serviceHost));
  p.pipe(replace(/@servicePort/, servicePort));

  if(isProduction) {
    p.pipe(uglify);
  }
  p.pipe(gulp.dest(path.join(destdir, 'script')));
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