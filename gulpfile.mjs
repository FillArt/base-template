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
import imageminOptipng from 'imagemin-optipng'
import fontmin from 'gulp-fontmin';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';

// ** Setting SCSS with compiler Sass
const sassCompiler = gulpSass(sass);
// ** BrowserSync instance
const sync = browserSync.create();

// ** Path to all JS files
const jsFiles = [
    'app/js/validate/parsley.js',
    'app/js/map/leaflet.js',
    'app/js/map/config.js',
    'app/js/main.js',
]

const cssFilesForJS = [
    'app/js/map/leaflet.css'
]

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
        src: 'app/pug/pages/*.pug',
        allSrc: 'app/pug/**/*.pug', // Путь ко всем Pug-файлам, включая поддиректории
        // allSrc: 'app/pug/**/**/*.pug',
        dest: 'dist'
    },
    SCSS: {
        src: 'app/scss/**/*.scss',
        demoSrc: 'app/scss/demo.scss',
        dest: 'app/css'
    },
    CSS: {
        src: 'app/css/*.css',
        JsLib: cssFilesForJS,
        dest: 'dist/css'
    },
    JS: {
        src: jsFiles,
        dest: 'dist/js' 
    }
  };

// ** Task for compiling PUG to HTML
export const compilePug = () => {
    return gulp.src(paths.PUG.src)                          // Path to the directory with PUG files
        .pipe(plumber({                                     // If happens to be error
            errorHandler: notify.onError({
                title: 'Pug Error',
                message: 'Error: <%= error.message %>'
            })
        }))

        .pipe(pug({                                         // Nice alignment
            pretty: true
        }))
    
        .pipe(gulp.dest(paths.PUG.dest))                    // Path to destination folder
        .pipe(sync.stream());                               // Inject changes to browser
  }


// ** Task for compiling SCSS to CSS
export const compileSCSS = () => {
    return gulp.src(paths.SCSS.src)                         // Path to the directory with SCSS files
        .pipe(sassGlob())                                   // Support globals import
        .pipe(sourcemaps.init())                            // Initialize sourcemaps
        .pipe(plumber({                                     // If happens to be error
            errorHandler: notify.onError({
                title: 'SCSS Error',
                message: 'Error: <%= error.message %>'
            })
        }))
        .pipe(sassCompiler({ outputStyle: 'expanded' }))    // Compile SCSS with Sass files
        .pipe(postcss([autoprefixer()]))                    // Add Autoprefixer
        .pipe(concat('styles.css'))                         // Concatenate all CSS files into one
        .pipe(sourcemaps.write())                           // Recording source maps  
        .pipe(gulp.dest(paths.SCSS.dest))                   // Path to destination folder
        .pipe(sync.stream());                               // Inject changes to browser
  }

  export const demoSCSS = () => {
    return gulp.src(paths.SCSS.demoSrc)                     // Path to the directory with SCSS files
        .pipe(sassGlob())                                   // Support globals import
        .pipe(sourcemaps.init())                            // Initialize sourcemaps
        .pipe(plumber({                                     // If happens to be error
            errorHandler: notify.onError({
                title: 'SCSS Demo Error',
                message: 'Error: <%= error.message %>'
            })
        }))
        .pipe(sassCompiler({ outputStyle: 'expanded' }))    // Compile SCSS with Sass files
        .pipe(postcss([autoprefixer()]))                    // Add Autoprefixer
        .pipe(sourcemaps.write())                           // Recording source maps  
        .pipe(gulp.dest(paths.SCSS.dest))                   // Path to destination folder
        .pipe(sync.stream());                               // Inject changes to browser
  }
  
// ** Task for minify CSS files
export const minifyCSS = () => {
    return src(paths.CSS.src)                               // Path to CSS source files
        .pipe(cleanCSS())                                   // Minified CSS
        // .pipe(rename({ suffix: '.min' }))                // Renames CSS files
        .pipe(dest(paths.CSS.dest));                        // Path to CSS update files
}

export const CssForJs = () => {
    return src(paths.CSS.JsLib)                               // Path to CSS source files
        .pipe(cleanCSS())                                   // Minified CSS
        // .pipe(rename({ suffix: '.min' }))                // Renames CSS files
        .pipe(dest(paths.CSS.dest));                        // Path to CSS update files
}

export const faviconToDest = () => {
    return src('app/favicon.ico')                               // Path to CSS source files
        .pipe(dest('dist'));                                    // Path to favicon
}  


// ** Task for minifying SVG and creating a sprite
export const svgMinifyAndSprite = () => {
    return gulp.src(paths.svg.src)                          // Path to SVG source files
      .pipe(svgmin())                                       // Minified SVG
      .pipe(svgstore({ inlineSvg: true }))                  // Make sprite
      .pipe(rename('sprite.svg'))                           // Rename
      .pipe(gulp.dest(paths.svg.dest))                      // Path to SVG sprite update
}

// ** Task for optimization images
export const optimizeImages = () => {
    return gulp.src(paths.images.src, { encoding: false })  // Path to all images
        .pipe(plumber())                                    // Error handler  
        .pipe(imagemin([                                    // Image optimization
            imageminMozjpeg({ quality: 75, progressive: true }),
            imageminOptipng({ optimizationLevel: 5 }),
        ]))
        .pipe(gulp.dest(paths.images.dest));                // Path to optimization images
}

// ** Task for converting to WebP
export const convertToWebp = () => {
    return gulp.src(paths.images.src, { encoding: false })  // Path to all images
        .pipe(plumber())                                    // Error handler
        .pipe(webp({                                        // Convert to WebP
            quality: 75,
            lossless: true
        }))
        .pipe(gulp.dest(paths.images.dest));                // Path to WebP images
}

// ** Task for working with fonts
export const minificatorFonts = () => {
    return gulp.src('app/fonts/**/*.*')                     // Path to all fonts
    //   .pipe(fontmin())                                      // Minificator fonts
      .pipe(gulp.dest('dist/fonts'));                       // Path to clear fonts 
}

// ** Task for working with JS files
export const scripts = () => {
    return gulp.src(paths.JS.src)                           // Path to all js files
      .pipe(sourcemaps.init())                              // Init sourcemap for debug
      .pipe(babel({
        presets: ['@babel/preset-env']                      // Transpiling modern JavaScript
      }))
      .pipe(concat('main.js'))                              // Concatenation of all JavaScript files into one
      .pipe(uglify())                                       // JavaScript Minification
      .pipe(sourcemaps.write('.'))                          // Recording source code maps
      .pipe(gulp.dest(paths.JS.dest))                       // Path to output files
      .pipe(sync.stream())                                  // Inject changes to browser
      .on('end', () => {
        // Move JQuery file
        gulp.src('app/js/jquery-3.7.1.js')                  // Path to JQuery File
          .pipe(gulp.dest(paths.JS.dest));                  // Put to output files
    });
  };

// ** Watcher for project
export function watchFiles() {
    gulp.watch(paths.PUG.allSrc, compilePug);               // Watch PUG files for changes
    gulp.watch(paths.SCSS.src, compileSCSS);                // Watch SCSS files for changes
    gulp.watch(paths.SCSS.demoSrc, demoSCSS);                // Watch SCSS files for changes
    gulp.watch(paths.svg.src, svgMinifyAndSprite);          // Watch SVG files for changes
    gulp.watch(paths.images.src, optimizeImages);           // Watch images for changes and optimize them
    gulp.watch(paths.images.src, convertToWebp);            // Watch images for changes and convert to WebP format
}

// ** Task for development
export const development = series(
    compilePug,
    compileSCSS,
    demoSCSS,
    minifyCSS,
    CssForJs,
    svgMinifyAndSprite,
    optimizeImages,
    convertToWebp,
    scripts,
    minificatorFonts,
    faviconToDest,
    function serve() {
        sync.init({
            server: {
                baseDir: 'dist'
            },
            notify: true
        });

        watch(paths.PUG.allSrc, compilePug);
        watch(paths.SCSS.src, series(compileSCSS, minifyCSS, CssForJs));
        watch(paths.SCSS.demoSrc, series(demoSCSS, minifyCSS, CssForJs));
        watch(paths.svg.src, svgMinifyAndSprite);
        watch(paths.images.src, optimizeImages);
        watch(paths.images.src, convertToWebp);
        watch(paths.JS.src, scripts);
    }
);

// ** Task for final build
export const build = series(
    compilePug,
    compileSCSS,
    minifyCSS,
    CssForJs,
    svgMinifyAndSprite,
    optimizeImages,
    convertToWebp,
    scripts,
    minificatorFonts,
    faviconToDest
);

export default development;
