import { NS } from "Bitburner";

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
    await createProgram(ns, programName);
    await ns.sleep(1);
  }
}

export async function createProgram(ns: NS, programName: string) {
  ns.tail();
  if (
    ns.singularity.purchaseTor() &&
    ns.singularity.purchaseProgram(programName)
  )
    return;
  if (!ns.singularity.isBusy() || !ns.getPlayer().workType.includes("Program"))
    ns.singularity.createProgram(programName);
}
