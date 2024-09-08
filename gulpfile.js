const { src, dest, parallel, series, watch } = require('gulp');

// Gulp plugins
const concat    = require('gulp-concat');       // Merge files into one
const cleanCSS  = require('gulp-clean-css');    // Minified CSS plugin
const rename    = require('gulp-rename');       // Rename plugin
const svgmin    = require('gulp-svgmin')        // Minified SVG plugin
const svgSprite = require('gulp-svg-sprite');   // Plugin for create SVG sprite
const sass = require('gulp-sass')(require('sass'));     // Plugin for working with SCSS files
const sourcemaps    = require('gulp-sourcemaps');       // Plugin for creating source map files SCSS (for debugging)
const autoprefixer  = require('gulp-autoprefixer');     // Plugin for supporting old browsers

// SVG Sprite configuration
const spriteConfig = {
    mode: {
        symbol: {
            sprite: 'sprite.svg',   // Path to SVG sprite
            example: false          // No generated html example
        }
    }
};

// Function for optimization and creation of sprite
const createSprite = () => {
    return src('app/assets/svg/*.svg')  // Path to SVG files
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
    return src('app/assets/scss/**/*.scss')         // Path to SCSS files
        .pipe(sassGlob())                           // Support globals import 
        .pipe(sourcemaps.init())                    // Initialize sourcemaps
        .pipe(sass().on('error', sass.logError))    // Compile scss
        .pipe(autoprefixer({                        // And vendor prefix
            cascade: false
        }))
        .pipe(sourcemaps.write())                   // Recording source maps
        .pipe(dest('app/assets/css'));              // Path to ready CSS files
};


// Function to minify CSS files
const minifyCSS = () => {
    return src('app/assets/css/*.css')      // Path to CSS source files
        .pipe(concat('styles.css'))         // Concatenates all CSS files into one file
        .pipe(cleanCSS())                   // Minified CSS
        .pipe(rename({ suffix: '.min' }))   // Renames CSS files
        .pipe(dest('dist/css'));            // Path to CSS update files
}

// Task function
const testTask = series(compileSCSS, minifyCSS);         // Test task


exports.default = testTask;
exports.createSprite = createSprite; // For SVG sprite