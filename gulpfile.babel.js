import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import browserSync from 'browser-sync';
import eslint from 'gulp-eslint';
import sass from 'gulp-sass';
import mocha from 'gulp-mocha';
import bower from 'gulp-bower';
import runSequence from 'gulp-sequence';
import clean from 'gulp-rimraf';
import babel from 'gulp-babel';

gulp.task('bs-reload', () => {
  browserSync.reload();
});

gulp.task('eslint', () => {
  gulp.src(['gulpfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'])
  .pipe(eslint())
  .pipe(eslint.formatEach('compact', process.stderr))
  .pipe(eslint.failAfterError());
});

gulp.task('sass', () => {
  gulp.src('public/css/common.scss')
  .pipe(sass())
  .pipe(gulp.dest('public/css/'));
});

gulp.task('test', ['transpile'], () => {
  gulp.src(['dist/test/**/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('watch', () => {
  gulp.watch(['app/views/**', 'public/views/**'], ['bs-reload']);
  gulp.watch(['public/js/**', 'app/**/*.js'], ['eslint', 'bs-reload']);
  gulp.watch(['public/css/common.scss, public/css/views/articles.scss'], ['sass']);
  gulp.watch(['public/css/**'], ['sass', 'bs-reload']);
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'dist/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    env: {
      PORT: 3000
    }
  });
});

gulp.task('bower', () => bower());

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

gulp.task('underscore', () => {
  gulp.src('bower_components/underscore/**/*')
        .pipe(gulp.dest('public/lib/underscore'));
});

gulp.task('intro', () => {
  gulp.src('bower_components/intro.js/**/*')
  .pipe(gulp.dest('public/lib/intro.js'));
});

gulp.task('angular-intro', () => {
  gulp.src('bower_components/angular-intro.js/**/*')
  .pipe(gulp.dest('public/lib/angular-intro.js'));
});

gulp.task('angular-cookies', () => {
  gulp.src('bower_components/angular-cookies/**/*')
  .pipe(gulp.dest('public/lib/angular-cookies'));
});

gulp.task('angular-resource', () => {
  gulp.src('bower_components/angular-resource/**/*')
  .pipe(gulp.dest('public/lib/angular-resource'));
});

gulp.task('font-awesome', () => {
  gulp.src('bower_components/font-awesome/**/*')
  .pipe(gulp.dest('public/lib/font-awesome'));
});

gulp.task('angular-unstable', () => {
  gulp.src('bower_components/angular-unstable/**/*')
  .pipe(gulp.dest('public/lib/angular-unstable'));
});

gulp.task('clean', () => {
  gulp.src('bower_components')
      .pipe(clean({ force: true }));
});

gulp.task('move_json', () => {
  gulp.src('config/env/**/*.json')
        .pipe(gulp.dest('dist/config/env'));
});

gulp.task('move_jades', () => {
  gulp.src('app/views/**/*')
        .pipe(gulp.dest('dist/app/views'));
});

gulp.task('move_libs', () => {
  gulp.src(['public/**/*', '!public/js/**'])
        .pipe(gulp.dest('dist/public'));
});

gulp.task('babelify', () => {
  gulp.src(['./**/*.js', '!dist/**', '!node_modules/**', '!bower_components/**', '!public/lib/**'])
  .pipe(babel())
  .pipe(gulp.dest('dist'));
});

gulp.task('transpile', runSequence('babelify', 'move_json', 'move_jades', 'move_libs'));
gulp.task('install', runSequence('bower', 'angular', 'angular-bootstrap', 'angularUtils', 'bootstrap', 'jquery', 'underscore', 'intro', 'angular-intro', 'angular-cookies', 'angular-unstable', 'font-awesome', 'angular-resource'));
gulp.task('default', runSequence('transpile'));
