"use strict";
const gulp = require("gulp");
const babel = require("gulp-babel");
const babelRegister = require("babel-core/register");
const exec = require("child_process").exec;
const mocha = require("gulp-mocha");
const istanbul = require("gulp-babel-istanbul");
const path = require("path");
const webpack = require("webpack");
const del = require("del");
const webpackConfigFrontend = {
	entry:path.resolve(__dirname, "dist/node/vectrix.js"),
	devtool:"source-map",
	output:{
		filename:"vectrix.bundle.js",
		path:path.resolve(__dirname, "dist/web/")
	},
	plugins:[
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
  ]
}

gulp.task("default", ["doc", "webpack"]);

gulp.task("clean", function() {
	return del(["target/*", "dist/*"]);
});

gulp.task("babel", ["clean"], function() {
	return gulp.src(["src/*js"])
	.pipe(babel())
	.pipe(gulp.dest("dist/node"));
});

/* jshint unused:false */
gulp.task("webpack", ["babel", "test"], function(callback) {
	webpack(webpackConfigFrontend, function(err, stats) {
		if(err) console.log(err);
		/*
		if (err) throw new gutil.PluginError('webpack', err);

		gutil.log('[webpack]', stats.toString({
			colors: true,
			progress: true
		}));
		*/
		callback();
	});
});

gulp.task("doc", function(cb) {
	exec("jsdox --templateDir docs/templates --output docs src/*.js", function(err, stdout, stderr) {
		console.log(stderr);
		console.log(stdout);
		cb(err);
	});
});

gulp.task("test", function() {
	return gulp.src(["test/*.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister
		}
	}));
});

gulp.task("test:vectors", function() {
	return gulp.src(["test/vectrix.vectors.test.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister
		}
	}));
});

gulp.task("test:matrices", function() {
	return gulp.src(["test/vectrix.matrices.test.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister 
		}
	}))
});

gulp.task("test:quaternions", function() {
	return gulp.src(["test/vectrix.quaternions.test.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister
		}
	}))
});

gulp.task("test:coverage", function(cb) {
	gulp.src(["src/*js"])
	.pipe(istanbul())
	.pipe(istanbul.hookRequire())
	.on("finish", function() {
		gulp.src(["test/*.js"])
		.pipe(mocha({
			compilers: {
				bail:true,
				js:babelRegister
			}
		}))
		.pipe(istanbul.writeReports())
		.on("end", cb)
	});
});
