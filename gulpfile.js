const { src, dest, parallel, series, watch } = require('gulp');

// Gulp plugins
const concat    = require('gulp-concat');       // Merge files into one
const cleanCSS  = require('gulp-clean-css');    // Minified CSS plugin
const rename    = require('gulp-rename');       // Rename plugin
const svgmin    = require('gulp-svgmin')        // Minified SVG plugin
const svgSprite = require('gulp-svg-sprite');   // Plugin for create SVG sprite
const pug       = require('gulp-pug');           // Plugin for working with PUG files
const plumber   = require('gulp-plumber');       // For error reporting
const sass = require('gulp-sass')(require('sass'));     // Plugin for working with SCSS files
const sourcemaps    = require('gulp-sourcemaps');       // Plugin for creating source map files SCSS (for debugging)
const postcss = require('gulp-postcss');        // For working with CSS files
const autoprefixer = require('autoprefixer');   // Adding vendor prefix
const sassGlob = require('gulp-sass-glob');     // Plugin for global import SCSS

// SVG Sprite configuration
const spriteConfig = {
    mode: {
        symbol: {
            sprite: 'sprite.svg',       // Path to SVG sprite
            example: false              // No generated html example
        }
    }
};

// Function for optimization and creation of sprite
const createSprite = () => {
    return src('app/svg/*.svg')         // Path to SVG files
        .pipe(svgmin({                  // Use svgmin for optimization
            plugins: [
                { removeViewBox: false },
                { cleanupIDs: false }
            ]
        }))
        .pipe(svgSprite(spriteConfig))  // Create SVG sprite
        .pipe(dest('dist/svg'));        // Path to output directory
}

// Function for working with SCSS files
const compileSCSS = () => {
    return src('app/scss/**/*.scss')                // Path to SCSS files
        .pipe(sassGlob())                           // Support globals import 
        .pipe(sourcemaps.init())                    // Initialize sourcemaps
        .pipe(sass().on('error', sass.logError))    // Compile scss
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(sourcemaps.write())                   // Recording source maps
        .pipe(dest('app/css'));                     // Path to ready CSS files
};


// Function to minify CSS files
const minifyCSS = () => {
    return src('app/css/*.css')             // Path to CSS source files
        .pipe(concat('styles.css'))         // Concatenates all CSS files into one file
        .pipe(cleanCSS())                   // Minified CSS
        .pipe(rename({ suffix: '.min' }))   // Renames CSS files
        .pipe(dest('dist/css'));            // Path to CSS update files
}

// Function for working with PUG files
const compilePug = () => {
    return src('app/pug/**/*.pug')          // Path to PUG templates
        .pipe(plumber())                    // Error Handling
        .pipe(pug({
            pretty: true                    // Formatted HTML output (optional)
        }))
        .pipe(dest('dist'));                // Path to save generated HTML files
};

// Task function
const testTask = series(compileSCSS, minifyCSS, compilePug);         // Test task


exports.default = testTask;
exports.createSprite = createSprite; // For SVG sprite