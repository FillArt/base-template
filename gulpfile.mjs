import gulp from 'gulp';
const { src, dest, parallel, series, watch } = gulp;
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';

// ** Setting SCSS with compiler Sass
const sassCompiler = gulpSass(sass);

// ** Path to the directory
const paths = {
    images: {
      src: 'app/img/**/*.{png,jpg,jpeg}',
      dest: 'dist/img'
    },
    svg: {
      src: 'app/svg/*.svg',
      dest: 'dist/img'  
    },
    PUG: {
        src: 'app/pug/**/*.pug',
        dest: 'dist'
    },
    // !! Temporary - here should be main file scss.
    SCSS: {
        src: 'app/scss/**/*.scss',
        dest: 'app/css'
    },
    CSS: {
        src: 'app/css/*.css',
        dest: 'dist/css'
    }
  };

// ** Task for compiling PUG to HTML
export const compilePug = () => {
    return gulp.src(paths.PUG.src)                      // Path to the directory with PUG files
        .pipe(plumber({                                 // If happens to be error
            errorHandler: notify.onError({
                title: 'Pug Error',
                message: 'Error: <%= error.message %>'
            })
        }))

        .pipe(pug({                                     // Nice alignment
            pretty: true
        }))
    
        .pipe(gulp.dest(paths.PUG.dest))                // Path to destination folder
  }


// ** Task for compiling SCSS to CSS
export function compileSCSS() {
    return gulp.src(paths.SCSS.src)                     // Path to the directory with SCSS files
        .pipe(sassGlob())                               // Support globals import
        .pipe(sourcemaps.init())                        // Initialize sourcemaps
        .pipe(plumber({                                 // If happens to be error
            errorHandler: notify.onError({
                title: 'SCSS Error',
                message: 'Error: <%= error.message %>'
            })
        }))
        .pipe(sassCompiler({ outputStyle: 'expanded' })) // Compile SCSS with Sass files
        .pipe(postcss([autoprefixer()]))                 // Add Autoprefixer
        .pipe(concat('styles.css'))                      // Concatenate all CSS files into one
        .pipe(sourcemaps.write())                        // Recording source maps  
        .pipe(gulp.dest(paths.SCSS.dest))                // Path to destination folder
  }
  
// ** Task for minify CSS files
const minifyCSS = () => {
    return src(paths.CSS.src)                            // Path to CSS source files
        .pipe(cleanCSS())                                // Minified CSS
        .pipe(rename({ suffix: '.min' }))                // Renames CSS files
        .pipe(dest(paths.CSS.dest));                     // Path to CSS update files
}  

// ** Task for minifying SVG and creating a sprite
export function svgMinifyAndSprite() {
    return gulp.src(paths.svg.src)                       // Path to SVG source files
      .pipe(svgmin())                                    // Minified SVG
      .pipe(svgstore({ inlineSvg: true }))               // Make sprite
      .pipe(rename('sprite.svg'))                        // Rename
      .pipe(gulp.dest(paths.svg.dest))                   // Path to SVG sprite update
}

// ** Function for optimization images
export function optimizeImages() {
    return gulp.src(paths.images.src, { encoding: false })// Path to all images
        .pipe(plumber())                                  // Error handler  
        .pipe(imagemin([                                  // Image optimization
            imageminMozjpeg({ quality: 75, progressive: true }),
            imageminOptipng({ optimizationLevel: 5 }),
        ]))
        .pipe(gulp.dest(paths.images.dest));              // Path to optimization images
}

// ** Function for converting to WebP
export function convertToWebp() {
    return gulp.src(paths.images.src, { encoding: false }) // Path to all images
        .pipe(plumber())                                   // Error handler
        .pipe(webp({                                       // Convert to WebP
            quality: 75,
            lossless: true
        }))
        .pipe(gulp.dest(paths.images.dest));               // Path to WebP images
}

// ** Watcher for project
  export function watchFiles() {
    gulp.watch(paths.PUG.src, compilePug);          // Watch PUG files for changes
    gulp.watch(paths.SCSS.src, compileSCSS);        // Watch SCSS files for changes
    gulp.watch(paths.svg.src, svgMinifyAndSprite);  // Watch SVG files for changes
    gulp.watch(paths.images.src, optimizeImages);   // Watch images for changes and optimize them
    gulp.watch(paths.images.src, convertToWebp);    // Watch images for changes and convert to WebP format
}

export default gulp.series(compilePug, compileSCSS, minifyCSS, svgMinifyAndSprite, optimizeImages, convertToWebp, watchFiles);
