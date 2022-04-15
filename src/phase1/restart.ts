import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";
import { monitor } from "ui/monitor";

// timing constants
const second = 1000; //milliseconds
const seconds = second;
const minute = 60 * seconds;
const minutes = minute;
const hour = 60 * minutes;
const hours = hour;
const day = 24 * hours;
// const days = day;

const phase2RAM = 500;

let restartDuration = 1 * day;

const scripts = [
  "backdoor.js",
  "/phase1/basicHack.js",
  // "/contracts/list.js",
  // "/contracts/start.js",
  // "programs.js",
  // "purchase.js",
  // "/stocks/start.js",
  "hacknet.js",
];

const restartScripts = ["/phase1/basicHack.js"];

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

  if (getTotalRam(ns) > phase2RAM) ns.spawn("phase2/restart.js");
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

    if (ns.fileExists("Formulas.exe")) {
      restartDuration = 30 * minutes;
    }

    if (
      ns.getOwnedSourceFiles().filter((sf) => sf.n === 4).length > 0 ||
      ns.getPlayer().bitNodeN === 4
    )
      for (const script of singularityScripts) {
        ns.run(script);
      }

    const restartTime = Date.now() + restartDuration;
    while (true) {
      ns.clearLog();
      ns.tail();
      monitor(ns);
      ns.print(
        `
      Hack Profit     : ${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")} / sec.
      Hack XP         : ${ns.nFormat(ns.getScriptExpGain(), "0.0a")} / sec.
      Home RAM        : ${ns.nFormat(ns.getServerMaxRam("home") * 1e9, "0.0b")}
      Servers Owned   : ${ns.getPurchasedServers().length}
      Total RAM       : ${ns.nFormat(getTotalRam(ns) * 1e9, "0.0b")}
      Phase 2 RAM     : ${ns.nFormat(phase2RAM * 1e9, "0.0b")}
`
      );
      ns.print(`Restart in ${ns.tFormat(restartTime - Date.now())}`);
      await ns.sleep(second);
      if (Date.now() >= restartTime) break;
      if (getTotalRam(ns) > phase2RAM) ns.spawn("phase2/restart.js");
    }
  }
}
function getTotalRam(ns: NS) {
  let total = 0;
  for (const { maxRam } of getRunnableServers(ns)) {
    total += maxRam;
  }
  return total;
}
