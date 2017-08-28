
//---------------------------------------- init ---------------------------------------//
const gulp = require('gulp');
const webpack = require('webpack');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const rimraf = require('rimraf');
const gulpWebpack = require('webpack-stream');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const spritesmith = require('gulp.spritesmith');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const gulpStylelint = require('gulp-stylelint');


// ---------------------------------------- webpack --------------------------//
gulp.task('webpack', function() {

    return gulp.src('src/scripts/main.js')
         .pipe(gulpWebpack(require('./webpack.config.js'),webpack))
         .on('error', function(){
            this.emit("end");
         })
         .on('error', notify.onError({title: "Webpack error"}))
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
    return gulp.src('./src/styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass()).on('error', notify.onError({ title: 'Style' }))
        .pipe(gulpStylelint({
            failAfterError: false,
            reporters: [
              {formatter: 'string', console: true}
            ]
          }))
        .pipe(postcss())
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build/assets/styles'))
        .pipe(browserSync.stream());
});
//------------------------------------------ copy img --------------------------------//
gulp.task('copy.image', function() {
    return gulp.src('./src/images/**/*.*', {since: gulp.lastRun('copy.image')})
      .pipe(gulp.dest('./build//assets/img'));
});
//------------------------------------------ copy fonts --------------------------------//
gulp.task('copy.fonts', function() {
    return gulp.src('./src/fonts/**/*.*', {since: gulp.lastRun('copy.fonts')})
      .pipe(gulp.dest('./build//assets/fonts'));
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
        'copy.image',
        'copy.fonts',
        'css',
        'webpack',
        'pug' 
    ),
    gulp.parallel(
        'watch',
        'serve'
    )
));

//------------------svg sprites------------------------------------------------------------//
gulp.task('sprite:svg', function() {
    return gulp.src('./srs/images/svg-sprites/*.svg')
      .pipe(svgmin({
        js2svg: {
          pretty: true
        }
      }))
      .pipe(cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
      }))
      .pipe(replace('&gt;', '>'))
      .pipe(svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg"
          }
        }
      }))
      .pipe(dest('./source/images/sprite'))
  });

  // ---------------------------png sprites --------------------------------//
 gulp.task('sprite:png', function() {
    var spriteData = gulp.src('./src/images/png-sprites/*.png')
      .pipe(spritesmith({
			    imgName: 'sprite.png',
			    cssName: 'sprite.scss',
          cssFormat: 'scss',
          imgPath: '../images/png-sprite/sprite.png',
          algorithm: 'binary-tree',
			    padding: 5,
          cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
			  }));

    spriteData.img.pipe(gulp.dest('./src/images/sprite'));
    spriteData.css.pipe(gulp.dest('./src/styles/common'));

    return spriteData;
  });