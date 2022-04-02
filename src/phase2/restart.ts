import { NS } from "Bitburner";
import { getMinRam } from "purchase";

// timing constants
const seconds = 1000; //milliseconds
const second = seconds;
const minutes = 60 * seconds;
const minute = minutes;
const hours = 60 * minutes;
const hour = hours;
const days = 24 * hours;
const day = days;

let restartDuration = 1 * day;

const scripts = [
  "backdoor.js",
  "hacknet.js",
  "/contracts/start.js",
  "programs.js",
  "purchase.js",
  "/phase2/batchHack.js",
  "/stocks/start.js",
  // "shareAll.js",
];

const restartScripts = [
  "/phase2/batchHack.js",
  //
];

const singularityScripts = [
  "/expandServer.js",
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
      if (getMinRam(ns) === ns.getPurchasedServerMaxRam())
        ns.spawn("restart.js");
    }
  }
}
