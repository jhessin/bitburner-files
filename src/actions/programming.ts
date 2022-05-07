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

export async function createProgram(
  ns: NS,
  programName: string
): Promise<boolean> {
  ns.tail();
  if (
    ns.fileExists(programName) &&
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.toLowerCase().includes("program") &&
    ns.getPlayer().createProgramName === programName
  ) {
    ns.singularity.stopAction();
    return false;
  }
  if (
    ns.singularity.purchaseTor() &&
    ns.singularity.purchaseProgram(programName)
  )
    return false;
  if (
    !ns.singularity.isBusy() ||
    !ns.getPlayer().workType.toLowerCase().includes("program")
  ) {
    // ns.toast(ns.getPlayer().workType);
    return ns.singularity.createProgram(programName);
  }
  return true;
}
