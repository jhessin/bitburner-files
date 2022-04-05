import { NS } from "Bitburner";

// timing constants
const seconds = 1000; //milliseconds
const second = seconds;
const minute = 60 * seconds;
const minutes = minute;
const hour = 60 * minutes;
const hours = hour;
const days = 24 * hours;
const day = days;

let restartDuration = 1 * day;
restartDuration = 30 * minutes;

const scripts = [
  "hacknet.js",
  "backdoor.js",
  "/phase3/batchHack.js",
  "/contracts/start.js",
  "programs.js",
  "purchase.js",
  "shareAll.js",
];

const restartScripts = [
  "/phase3/batchHack.js",
  "/stocks/start.js",
  "shareAll.js",
  //
];

const singularityScripts = [
  "expandServer.js",
  //
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This is a simple script that restarts the automated scripts periodically.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }
  for (const script of scripts) {
    ns.run(script);
    // This delay is to keep the scripts from colliding.
    await ns.sleep(5000);
  }
  while (true) {
    for (const script of restartScripts) {
      ns.run(script);
      // This delay is to keep the scripts from colliding.
      await ns.sleep(5000);
    }

    let hasFormulas = ns.fileExists("Formulas.exe");
    if (hasFormulas) {
      restartDuration = 30 * minutes;
    }

    if (
      ns.getOwnedSourceFiles().filter((sf) => sf.n === 4).length > 0 ||
      ns.getPlayer().bitNodeN === 4
    )
      for (const script of singularityScripts) {
        ns.scriptKill(script, ns.getHostname());
        ns.run(script);
      }

    const restartTime = Date.now() + restartDuration;
    while (true) {
      ns.clearLog();
      ns.tail();
      ns.print(
        `
      Hack Profit  : ${ns.nFormat(ns.getScriptIncome()[0], "$0.000a")} / sec.
      Hack XP      : ${ns.nFormat(ns.getScriptExpGain(), "0.000a")} / sec.
`
      );
      ns.print(`Restart in ${ns.tFormat(restartTime - Date.now())}`);
      await ns.sleep(second);
      if (Date.now() >= restartTime) break;
      if (!hasFormulas && ns.fileExists("Formulas.exe")) {
        restartDuration = 30 * minutes;
        break;
      }
    }
  }
}
