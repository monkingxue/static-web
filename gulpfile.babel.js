import gulp from 'gulp';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import cached from 'gulp-cached';
import remember from 'gulp-remember';
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import runSequence from 'run-sequence';
import minCss from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import browserSync, {reload} from 'browser-sync';
import del from 'del';

const src = {
  html: ["src/html/*.html", "index.html"],
  style: "src/style/**/*.scss",
  js: "src/js/**/*.js",
  assets: "src/assets/**/*"
};

const dist = {
  root: "dist/",
  html: "dist/html",
  style: "dist/style",
  js: "dist/js",
  assets: "dist/assets"
};

gulp.task('browser', () => {
  browserSync({
    server: {
      baseDir: './',
    },
    port: 4001
  });
});

gulp.task('clean', (done) => {
  del.sync(dist.root);
  done();
});

gulp.task('copyHtml', () =>
  gulp.src(src.html)
    .pipe(gulp.dest(dist.html))
    .pipe(reload({stream: true})));

gulp.task('css', () =>
  gulp.src(src.style)
    .pipe(cached('style'))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(minCss())
    .pipe(remember('style'))
    .pipe(concat('puck.css'))
    .pipe(gulp.dest(dist.style))
    .pipe(reload({stream: true})));

gulp.task('devJs', () =>
  gulp.src(src.js)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(cached('js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(remember('js'))
    .pipe(concat('puck.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist.js))
    .pipe(reload({stream: true})));

gulp.task('copyAssets', () =>
  gulp.src(src.assets)
    .pipe(gulp.dest(dist.assets))
    .pipe(reload({stream: true})));

gulp.task('proJs', () =>
  gulp.src(src.js)
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('puck.js'))
    .pipe(gulp.dest(dist.js)));

gulp.task('watch', () => {
  gulp.watch(src.html, ['copyHtml']);
  gulp.watch(src.style, ['css']);
  gulp.watch(src.js, ['devJs']);
  gulp.watch(src.assets, ['copyAssets']);
});

gulp.task('default', cb => {
  runSequence(
    'clean',
    ['copyHtml', 'css', 'devJs', 'copyAssets', 'browser', 'watch'],
    cb
  );
});

gulp.task('build', cb => {
  process.env.NODE_ENV = 'production';
  runSequence(
    'clean',
    ['copyHtml', 'css', 'proJs', 'copyAssets'],
    cb
  );
});