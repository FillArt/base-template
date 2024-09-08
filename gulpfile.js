const { src, dest, parallel, series, watch } = require('gulp');

// Gulp plugins
const concat    = require('gulp-concat');       // Merge files into one
const cleanCSS  = require('gulp-clean-css');    // Minified CSS plugin
const rename    = require('gulp-rename');       // Rename plugin
const svgmin    = require('gulp-svgmin')        // Minified SVG plugin
const svgSprite = require('gulp-svg-sprite');   // Create SVG sprite

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
        .pipe(dest('dist/svg')); // Путь к выходной директории
}


// Function to minify CSS files
const minifyCSS = () => {
    return src('app/assets/css/*.css')      // Path to CSS source files
        .pipe(concat('styles.css'))         // Concatenates all CSS files into one file
        .pipe(cleanCSS())                   // Minified CSS
        .pipe(rename({ suffix: '.min' }))   // Renames CSS files
        .pipe(dest('dist/css'));            // Path to CSS update files
}

// Task function
const testTask = series(minifyCSS);         // Test task

// Watch task
function watchFiles() { 
    watch('src/css/*.css', minifyCSS);
}

exports.default = testTask;
exports.createSprite = createSprite;