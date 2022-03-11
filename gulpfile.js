const gulp = require("gulp");
const run = require("gulp-run");
const del = require("del");
const ts = require("gulp-typescript");

function clean() {
  return del(["home/**/*.js"]);
}

function tsc() {
  const tsProject = ts.createProject("tsconfig.json");
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("home"));
}

function sync() {
  return run("yarn bitburner-sync").exec();
}

const push = gulp.series(clean, tsc, sync);

module.exports = {
  clean,
  tsc,
  sync,
  push,
  default: () => gulp.watch("src/**/*.ts", { ignoreInitial: false }, push),
};
