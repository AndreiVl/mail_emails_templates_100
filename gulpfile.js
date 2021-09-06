"use strict";

const gulp = require("gulp");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-sass");
const del = require("del");
const browserSync = require("browser-sync").create();
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const pug = require("gulp-pug");
const flatten = require("gulp-flatten");
const inlineCss = require("gulp-inline-css");
const htmlmin = require("gulp-html-minifier");

var path = {
	build: {
		html: "build/",
		js: "build/js/",
		css: "build/css/",
		img: "build/images/",
		fonts: "build/fonts/",
	},
	src: {
		style: "src/sass/style.scss",
		pug: "src/pages/*.pug",
		pug_ready: "src/pages/ready/*.pug",
		img: "src/blocks/**/*.{png,jpg,jpeg,svg,gif}",
		resources_img: "src/resources/images/**/*.{png,jpg,jpeg,svg,gif}",
	},
	watch: {
		style: "src/**/*.scss",
		pug: "src/**/*.pug",
		img: "src/blocks/**/*.{png,jpg,jpeg,svg,gif}",
		resources_img: "src/resources/images/*.{png,jpg,jpeg,svg,gif}",
	},
	clean: "./build",
};

var plumberCfg = {
	errorHandler: notify.onError(function (err) {
		return {
			message: err.message,
		};
	}),
};

gulp.task("sass", function () {
	return gulp
		.src(path.src.style)
		.pipe(plumber(plumberCfg))
		.pipe(sass())
		.pipe(
			autoprefixer({
				browsers: ["last 2 versions"],
				cascade: false,
			})
		)
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(gulp.dest(path.build.css));
});

gulp.task("pug", function () {
	return gulp
		.src(path.src.pug /*, {since: gulp.lastRun('pug')}*/)
		.pipe(plumber(plumberCfg))
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(gulp.dest(path.build.html));
});

gulp.task("pug_ready", function () {
	return gulp
		.src(path.src.pug_ready /*, {since: gulp.lastRun('pug')}*/)
		.pipe(plumber(plumberCfg))
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(gulp.dest(path.build.html));
});

gulp.task("images", function () {
	return (
		gulp
			.src(path.src.img)
			.pipe(flatten())
			//.pipe(imagemin())
			.pipe(gulp.dest(path.build.img))
	);
});

gulp.task("resources_images", function () {
	return (
		gulp
			.src(path.src.resources_img, { since: gulp.lastRun("resources_images") })
			.pipe(flatten())
			//.pipe(imagemin())
			.pipe(gulp.dest(path.build.img))
	);
});

gulp.task("inline-css", function () {
	return gulp
		.src("build/*.html")
		.pipe(
			inlineCss({
				applyStyleTags: false,
				removeStyleTags: false,
				removeHtmlSelectors: false,
				removeLinkTags: false,
			})
		)
		.pipe(gulp.dest(path.build.html));
});

gulp.task("minify_html", function () {
	gulp
		.src(path.build.html + "*.html")
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(path.build.html));
});

gulp.task("clean", function () {
	return del("build/**/*");
});

gulp.task("watch", function () {
	gulp.watch(path.watch.style, gulp.series("sass"));
	gulp.watch(path.watch.pug, gulp.series("pug"));
	gulp.watch(path.watch.img, gulp.series("images"));
	gulp.watch(path.watch.resources_img, gulp.series("resources_images"));
});

gulp.task("server", function () {
	browserSync.init({
		server: path.build.html,
	});

	browserSync.watch(path.build.html + "/**/*.*").on("change", browserSync.reload);
});

gulp.task("default", gulp.series("clean", "sass", "pug", "images", "resources_images", gulp.parallel("watch", "server")));
gulp.task(
	"build",
	gulp.series(
		"clean",
		"sass",
		"pug",
		"pug_ready",
		"images",
		"resources_images",
		"inline-css"
		// 'minify_html'
	)
);
