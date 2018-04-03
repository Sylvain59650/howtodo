"use strict";
(function() {

  var babel = require("gulp-babel");
  var gulp = require("gulp");
  var concat = require("gulp-concat");
  //var uglify = require("gulp-uglify");
  //var clean = require("gulp-clean");
  var debug = require("gulp-debug");
  var watch = require("gulp-watch");
  //var gutil = require("gulp-util");
  const eslint = require("gulp-eslint");
  const gulpIf = require("gulp-if");


  var chemins = {
    sources: "./src/",
    distrib: "./distrib/"
  };

  function isFixed(file) {
    return file.eslint !== null && file.eslint.fixed;
  }

  gulp.task("howtodo.min.js", () => {
    return gulp.src([
        "src/**.js"
      ])
      .pipe(concat("howtodo.min.js"))
      .pipe(babel({
        presets: ["es2015"],
        compact: true
      }))
      //.pipe(uglify())
      //.on("error", function(err) { gutil.log(gutil.colors.red("[Error]"), err.toString()); })
      // .pipe(umd())
      .pipe(gulp.dest(chemins.distrib))
  });



  gulp.task("lint", () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it"s best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(["src/helps.js", "!node_modules/**"])
      .pipe(debug())
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint({ fix: true }))
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      .pipe(gulpIf(isFixed, gulp.dest("/obj")))
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError());
  });

  gulp.task("watch:howtodo.min.js", function() {
    watch("./src**.js", function() {
      gulp.run("howtodo.min.js");
    });
  });

  gulp.task("lint-css", function lintCssTask() {
    const gulpStylelint = require("gulp-stylelint");

    return gulp
      .src("src/**/*.css")
      .pipe(gulpStylelint({
        fix: true,
        reporters: [
          { formatter: "string", console: true }
        ]
      }));
  });

  gulp.task("default", ["howtodo.min.js"]);


  gulp.task("all", ["default"]);

  gulp.task("watch", ["watch:howtodo.min.js"]);

})();