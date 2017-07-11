var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var mocha = require('gulp-mocha');
var bower = require('gulp-bower');

gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('jshint', function () {
  gulp.src(['gulpfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
  gulp.src('public/css/common.scss')
  .pipe(sass())
  .pipe(gulp.dest('public/css/'));
});

gulp.task('test', function () {
  return gulp.src(['test/**/*.js'], {read: false})
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        should: require('should')
      }
    }));
});

gulp.task('watch', function () {
  gulp.watch(['app/views/**', 'public/views/**'], ['bs-reload']);
  gulp.watch(['public/js/**', 'app/**/*.js'], ['jshint', 'bs-reload']);
  gulp.watch(['public/css/common.scss, public/css/views/articles.scss'], ['sass']);
  gulp.watch(['public/css/**'], ['sass', 'bs-reload']);
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    env: { 
      PORT: 3000
     }
  });
});

gulp.task('install', function () {
  return bower();
});

gulp.task('concurrent', ['watch', 'nodemon']);
gulp.task('default', ['jshint', 'concurrent', 'sass']);
