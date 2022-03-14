import { NS } from "Bitburner";
import { PortHackPrograms, keys } from "consts";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will generate any possible hacking programs.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  // simple trick to let others know when I need to program.
  localStorage.setItem(keys.isProgramming, "");
  while (true) {
    await ns.sleep(300);
    ns.clearLog();
    let programCount = 0;
    for (const program of PortHackPrograms) {
      if (ns.fileExists(program)) {
        programCount++;
        continue;
      }
      if (localStorage.getItem(keys.isProgramming) !== "true")
        if (ns.createProgram(program)) {
          localStorage.setItem(keys.isProgramming, "true");
          while (ns.isBusy()) {
            await ns.sleep(1);
          }
          localStorage.setItem(keys.isProgramming, "");
        }
    }
    if (programCount === PortHackPrograms.length) return;
  }
}
