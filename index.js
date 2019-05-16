'use strict';

const fs = require('fs').promises;
const path = require("path");
const PluginError = require("plugin-error");
const Toposort = require("toposort-class");
const Transform = require('readable-stream/transform');
const util = require("util");

/**
 * Takes a list of 'folders' container packages installed with bower, and returns the contents of mains for all
 * packages in dependency order.
 */
class BowerMains extends Transform {
	constructor() {
		super();
		this.toposort = new Toposort();
		this.packageMeta = [];
	}

	/**
	 * Index and build the dependency graph for the bower packages.
	 *
	 * @param {*} file
	 * @param {*} encoding
	 * @param {*} callback
	 */
	_transform(file, encoding, callback) {
		if(file.isStream()) {
			this.emit("error", new PluginError("gulp-concat-vendor", "Streaming not supported"));
			return callback();
		}

		// skips files in the stream, we only want to operate on directories.
		// we want to iterate over the folders where we've installed modules
		// and look for the .bower.json
		if(!file.isDirectory()) {
			this.files.push(file.path);
			return callback();
		}

		let bowerJsonPath = path.join(file.path, '.bower.json');
		fs.open(bowerJsonPath)
			.catch((e) => {
				console.log(util.format("Skipping library @ %s. Couldn't find %s. (e: %s)", file.path, bowerJsonPath, e));
				return callback();
			})
			.then((handle) => fs.readFile(handle, {encoding}))
			.catch((e) => {
				console.log(util.format("Skipping library @ %s. Couldn't read %s. (e: %s)", file.path, bowerJsonPath, e));
				return callback();
			})
			.then((data) => JSON.parse(data))
			.catch((e) => {
				console.log(util.format("Skipping library @ %s. Couldn't parse %s. (e: %s)", file.path, bowerJsonPath, e));
				return callback();
			})
			.then((bower) => {
				if (!bower) throw new Error("No data")
				return bower;
			})
			.catch((e) => {
				console.log(util.format("Skipping library @ %s. No data in %s. (e: %s)", file.path, bowerJsonPath, e));
				return callback();
			})
			.then((bower) => {
				if (!bower.main) throw new Error("No main")
				return bower;
			})
			.catch((e) => {
				console.log(util.format("Skipping library @ %s because .bower.json is missing 'main' property.", file.path));
				return callback();
			})
			.then((bower) => {
				// store meta data and build dependency tree.
				this.packageMeta[bower.name] = bower;
				let dependencies = data.dependencies && Object.keys(bower.dependencies) || [];
				this.toposort.add(bower.name, dependencies);
				return callback();
			});
	}

	// inject all the main files in reverse dependency order for concatenation.
	_flush() {
		let orderdPackages = this.toposort.sort().reverse();
		orderdPackages.forEach((name) => {
			let bower = this.packageMeta[name];
			// normalize singular and arrays as an array.
			let mains =	[].concat(bower.mains)
			// inject each main into gulp stream.
			mains.forEach((main) => {
				let file = new Vinyl({ path: main });
				this.push(file)
			});
		});
	}
}

function factory(filename) {
	return new BowerMains();
}

module.exports = factory;
