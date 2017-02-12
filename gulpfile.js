
//---------------------------------------- init ---------------------------------------//
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const rimraf = require('rimraf');
const gulpWebpack = require('webpack-stream');


//---------------------------------------- webpack ---------------------------------------//
gulp.task('webpack', function() {
    return gulp.src('src/scripts/main.js')
        .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
        .pipe(gulp.dest('./build'));   

});
//---------------------------------------- pug -----------------------------------------//
gulp.task('pug', function() {
    return gulp.src('./src/templates/index.pug')
      .pipe(pug({ pretty: true }))
      .on('error', notify.onError(function(error) {
        console.log(123);
        return {
          title: 'pug',
          message:  error.message
        }
       }))
      .pipe(gulp.dest('./build'));
  });
//---------------------------------------- css ---------------------------------------//
gulp.task('css', function () {
    return gulp.src('./src/styles/main.css')
        .pipe(sourcemaps.init())
        .pipe(postcss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build/assets/styles'))
        .pipe(browserSync.stream());
});

//---------------------------------------- watch ---------------------------------------//
gulp.task('watch', function() {
    gulp.watch('./src/scripts/**/*.js', gulp.series('webpack'));
    gulp.watch('./src/styles/**/*.css', gulp.series('css'));
    gulp.watch('./src/templates/**/*.pug', gulp.series('pug'));
});

//---------------------------------------- server ---------------------------------------//
gulp.task('serve', function() {

    browserSync.init({
        //proxy: 'localhost:3000',
        open: false,
        server: './build'

    });

    browserSync.watch(['./build' + '/**/*.*', '!**/*.css'], browserSync.reload);
});


//---------------------------------------- clean ---------------------------------------//
gulp.task('clean', function(cb) {
    return rimraf('./build', cb);
});


//---------------------------------------- default ---------------------------------------//
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'css',
        'webpack',
        'pug' 
    ),
    gulp.parallel(
        'watch',
        'serve'
    )
));
