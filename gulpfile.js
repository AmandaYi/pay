var gulp = require('gulp');
var browserSync = require('browser-sync').create();
// 压缩html文件
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
// var sass     = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
// 图片压缩
var imagemin = require('gulp-imagemin'), // 图片压缩
  pngquant = require('imagemin-pngquant'); // 深度压缩 
var reload = browserSync.reload;
// 错误阻止
var plumber = require('gulp-plumber');
// 重命名插件
var rename = require('gulp-rename');
// 错误调试地图
var sourcemaps = require('gulp-sourcemaps');
// 只更新修改过的文件
var changed = require('gulp-changed');
// 合并JS
var concat = require("gulp-concat");
// 静态服务器 + 监听 html,css 文件
gulp.task('serve', ['html', 'less', 'js', 'images'], function() {
  browserSync.init({
    server: "./build/",
    port: "1111"
  });
  // 监听任务
  // 监听 html
  gulp.watch('./src/*.html', ['html'])
    // 监听 scss
  gulp.watch('./src/less/*.less', ['less']);
  // 监听 images
  gulp.watch('./src/images/*.{png,jpg,gif,svg}', ['images']);
  // 监听 js
  gulp.watch('./src/js/*.js', ['js']);
});
// html
gulp.task('html', function() {
  var options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };
  return (gulp.src("./src/*.html")
    .pipe(plumber())
    .pipe(htmlmin(options))
    .pipe(gulp.dest("./build/"))
    .pipe(reload({
      stream: true
    })));

});
// less编译后的css将注入到浏览器里实现更新
gulp.task('less', function() {
  return (
    gulp.src("./src/less/*.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest("./build/css/"))
    .pipe(reload({
      stream: true
    })));
});
// JS文件的压缩
gulp.task('js', function() {
  return (
    gulp.src('src/js/*.js')
    .pipe(plumber())
    // 执行sourcemaps
    .pipe(sourcemaps.init())
    .pipe(rename({
      suffix: '.min'
    })) // 重命名
    // 保留部分注释
    .pipe(uglify())
    // 地图输出路径（存放位置）
    .pipe(sourcemaps.write('./build/js/maps/'))
    .pipe(gulp.dest('./build/js/')) // 输出路径
    .pipe(reload({
      stream: true
    })));
});

// 图片压缩
gulp.task('images', function() {
  //文件格式匹配,目前是png,jpg,gif,svg
  return (
    gulp.src('src/images/*.{png,jpg,gif,svg}')
    .pipe(plumber())
    // 对比文件是否有过改动（此处填写的路径和输出路径保持一致）
    .pipe(changed('./build/images/'))
    .pipe(imagemin({
      // 无损压缩JPG图片
      progressive: true,
      // 不移除svg的viewbox属性
      svgoPlugins: [{
        removeViewBox: false
      }],
      // 使用pngquant插件进行深度压缩
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./build/images/')) // 输出路径
    .pipe(reload({
      stream: true
    })));
});
// gulp.task('sass', function () {
//      return sass('src/sass', { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（style: 'compressed' 表示输出格式）
//           .on('error', function (err) {
//                console.error('Error!', err.message); // 显示错误信息
//           })
//           .pipe(gulp.dest('dist/css')); // 输出路径
// });
gulp.task('default', ['serve'], function() {
  gulp.start(['html', 'less', 'js', 'images']);
});


// 以下任务按照需要运行
// 合并JS
// gulp.task('concat', function () {
//     gulp.src('js/*.min.js')  // 要合并的文件
//     .pipe(concat('libs.js'))  // 合并成libs.js
//     .pipe(gulp.dest('dist/js'));
// });