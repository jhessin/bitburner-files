import { NS } from "Bitburner";

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
  "/backdoor.js",
  "hacknet.js",
  // "/contracts/list.js",
  "/contracts/start.js",
  "programs.js",
  "purchase.js",
  "/stocks/start.js",
  "/phase1/basicHack.js",
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
      ns.print(
        `
      Hack Profit     : ${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")} / sec.
      Hack XP         : ${ns.nFormat(ns.getScriptExpGain(), "0.0a")} / sec.
      Home RAM        : ${ns.nFormat(ns.getServerMaxRam("home") * 1e9, "0.0b")}
      Servers Owned   : ${ns.getPurchasedServers().length}
      Total RAM       : ${ns.nFormat(getTotalRam(ns) * 1e9, "0.0b")}
`
      );
      ns.print(`Restart in ${ns.tFormat(restartTime - Date.now())}`);
      await ns.sleep(second);
      if (Date.now() >= restartTime) break;
      if (getTotalRam(ns) > 1e6) ns.spawn("phase2/restart.js");
    }
  }
}
function getTotalRam(ns: NS) {
  let total = ns.getServerMaxRam("home");
  if (ns.getPurchasedServers().length === 0) return total;
  for (const host of ns.getPurchasedServers()) {
    total += ns.getServerMaxRam(host);
  }
  return total;
}
