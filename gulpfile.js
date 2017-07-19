var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var eslint = require('gulp-eslint');
var sass = require('gulp-sass');
var mocha = require('gulp-mocha');
var bower = require('gulp-bower');
var runSequence = require('gulp-sequence');
var clean = require('gulp-rimraf');

gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('eslint', function () {
  gulp.src(['gulpfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'])
  .pipe(eslint())
  .pipe(eslint.formatEach('compact', process.stderr))
  .pipe(eslint.failAfterError());
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
})

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

gulp.task('bower', function() {
  return bower();
});

gulp.task('angular', () => {
    gulp.src('bower_components/angular/**/*.js')
        .pipe(gulp.dest('public/lib/angular'));
});

gulp.task('angular-bootstrap', () => {
    gulp.src('bower_components/angular-bootstrap/**/*')
        .pipe(gulp.dest('public/lib/angular-bootstrap'));
});

gulp.task('angularUtils', () => {
    gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
        .pipe(gulp.dest('public/lib/angular-ui-utils/modules'));
});

gulp.task('bootstrap', () => {
    gulp.src('bower_components/bootstrap/dist/**/*')
        .pipe(gulp.dest('public/lib/bootstrap'));
});

gulp.task('jquery', () => {
    gulp.src('bower_components/jquery/**/*')
        .pipe(gulp.dest('public/lib/jquery'));
});


gulp.task('underscore', function () {
    gulp.src('bower_components/underscore/**/*')
        .pipe(gulp.dest('public/lib/underscore'));
});

gulp.task('clean', function() {
  gulp.src('bower_components')
      .pipe(clean({ force: true }));
});

gulp.task('install', runSequence('bower', 'angular', 'angular-bootstrap', 'angularUtils', 'bootstrap', 'jquery', 'underscore'));
gulp.task('concurrent', ['watch', 'nodemon']);
gulp.task('default', ['eslint', 'concurrent', 'sass']);
