const gulp = require("gulp");
const run = require("gulp-run");
const ts = require("gulp-typescript");

exports.tsc = function tsc() {
  const tsProject = ts.createProject("tsconfig.json");
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("home"));
};

exports.sync = function sync() {
  return run("yarn bitburner-sync").exec();
};

exports.compile = gulp.series(exports.tsc, exports.sync);

exports.default = () =>
  gulp.watch("src/**/*.ts", { ignoreInitial: false }, exports.compile);
