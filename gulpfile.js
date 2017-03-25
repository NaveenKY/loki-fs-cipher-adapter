var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
	var files = [
		'node_modules/crypto-js/crypto-js.js',
		'src/main.js'
	];

	return gulp.src(files)
		.pipe(concat('index.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});