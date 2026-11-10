
import { src, dest, watch, series, parallel } from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import imagemin from 'gulp-imagemin';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';

const sass = gulpSass(dartSass);
const browser = browserSync.create();

function clean() {
    return deleteAsync(['dist']);
}

function html() {
    return src('src/*.html')
        .pipe(dest('dist'));
}

function styles() {
    return src('src/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('dist/css'));
}

function scripts() {
    return src('src/js/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('dist/js'));
}


function images() {
    return src('src/images/**/*.{png,jpg,jpeg,gif,svg}', { encoding: false })
        .pipe(imagemin())
        .pipe(dest('dist/images'));
}


function serve(done) {
    browser.init({
        server: {
            baseDir: 'dist'
        }
    });
    done();
}

function reload(done) {
    browser.reload();
    done();
}

function watchFiles(done) {
    watch('src/*.html', series(html, reload));
    watch('src/scss/**/*.scss', series(styles, reload));
    watch('src/js/**/*.js', series(scripts, reload));
    watch('src/images/**/*', series(images, reload));
    done();
}

export { clean, styles, scripts, images };
export const build = series(clean, parallel(html, styles, scripts, images));
export default series(build, serve, watchFiles);
