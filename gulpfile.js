const { src, dest, parallel, series, watch } = require('gulp');

// Gulp plugins
const concat    = require('gulp-concat');
const cleanCSS  = require('gulp-clean-css'); // Minified CSS plugin
const rename    = require('gulp-rename');

// Function to minify CSS files
let minifyCSS = () => {
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