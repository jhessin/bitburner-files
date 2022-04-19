import { NS } from "Bitburner";
import { hasSourceFile } from "actions/test";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const programName = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !programName) {
    ns.tprint(`
      This script will create a program for you.
      It requires Source File 4 to work.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} PROGRAM_NAME
      `);
    return;
  }
  ns.disableLog("ALL");
  while (!ns.fileExists(programName)) {
    ns.clearLog();
    ns.tail();
    ns.print(`Creating ${programName}`);
    if (hasSourceFile(ns, 4)) {
      if (ns.purchaseTor() && ns.purchaseProgram(programName)) return;
      if (!ns.isBusy() || !ns.getPlayer().workType.includes("Program"))
        ns.createProgram(programName);
    } else if (!ns.getPlayer().workType.includes("Program")) {
      ns.toast(`please create or purchase ${programName}`);
    }
    await ns.sleep(1000);
  }
}
