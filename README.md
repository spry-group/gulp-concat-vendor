## Information

| Package| gulp-concat-vendor |
| Description | Concatenates external libraries installed by Bower sorted by their dependencies |
| Node Version | >= 0.10 |

[![NPM version](http://img.shields.io/npm/v/gulp-concat-vendor.svg)](https://www.npmjs.org/package/gulp-concat-vendor)
[![Dependency Status](https://david-dm.org/patrickpietens/gulp-concat-vendor.svg)](https://david-dm.org/patrickpietens/gulp-concat-vendor)
[![Downloads](http://img.shields.io/npm/dm/gulp-concat-vendor.svg)](https://www.npmjs.org/package/gulp-concat-vendor)

##Installation

```bash
npm install gulp-concat-vendor --save-dev
```

## Usage

```javascript
var vendor = require('gulp-concat-vendor');

gulp.task('scripts', function() {
  	gulp.src('./scripts/vendor/*')
		.pipe(vendor('vendor.js'))
		.pipe(gulp.dest('./dist/scripts'));
});
```

This will concat all external libraries installed by [Bower](http://bower.io/). It will sort all files depending on their dependencies before concating. Libraries not installed with [Bower](http://bower.io/) - that is, when the bower.json file was not found - will be skipped.

Libraries like [Modernizr](http://modernizr.com/) don't use a bower.json file.
Therefor you can add files manually to the concatenation, like so:

```javascript
var vendor = require('gulp-concat-vendor');

gulp.task('scripts', function() {
	gulp.src([
		'./scripts/vendor/*',
		'./scripts/vendor/modernizr/modernizr.js'
	])
	.pipe(vendor('vendor.js'))
	.pipe(gulp.dest('./dist/scripts'));
});
```
