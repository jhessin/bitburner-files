import { NS } from "Bitburner";
import { PortHackPrograms } from "consts";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will purchase any possible hacking programs.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  while (true) {
    await ns.sleep(300);
    if (!ns.getPlayer().tor) {
      if (!ns.purchaseTor()) continue;
    }

    let programCount = 0;
    for (const program of PortHackPrograms) {
      if (ns.fileExists(program)) {
        programCount++;
        continue;
      }
      if (!ns.isBusy()) ns.purchaseProgram(program);
    }
    if (programCount === PortHackPrograms.length) return;
  }
}
