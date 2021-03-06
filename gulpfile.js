const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const connect = require('gulp-connect')
const gulp = require('gulp')
const gutil = require('gulp-util')
const minifyCSS = require('gulp-minify-css')
const minifyHTML = require('gulp-minify-html')
const plumber = require('gulp-plumber')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const watchify = require('watchify')

const htmlPath = 'src/html/index.html'
const jsPath = 'src/js/main.js'
const distPath = 'dist'

gulp.task('connect', () => {
  connect.server({livereload: true})
})

gulp.task('reload', () => {
  gulp.src(distPath).pipe(connect.reload())
})

gulp.task('html', () => {
  gulp.src(htmlPath)
    .pipe(minifyHTML())
    .pipe(gulp.dest(distPath))
})

gulp.task('jsDev', () => {
  const bundler = watchify(browserify(jsPath, Object.assign({}, watchify.args, {debug: true})))

  bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(plumber())
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
})

gulp.task('jsProd', () => {
  const bundler = browserify({
    entries: jsPath,
  })

  bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
})

gulp.task('css', () => {
  gulp.src('src/index.css')
    .pipe(plumber())
    .pipe(minifyCSS())
    .pipe(gulp.dest(distPath))
})

gulp.task('watch', () => {
  gulp.start('jsDev', 'html', 'css', 'connect')
  gulp.watch('src/js/**/*.js', ['jsDev'])
  gulp.watch(htmlPath, ['html'])
  gulp.watch('src/**/*.css', ['css'])
  gulp.watch(distPath, ['reload'])
})

gulp.task('build', ['jsProd', 'html', 'css'])
gulp.task('default', ['watch'])
