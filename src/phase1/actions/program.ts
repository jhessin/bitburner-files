import { NS } from "Bitburner";

const programs: [string, number][] = [
  ["BruteSSH.exe", 50],
  ["FTPCrack.exe", 100],
  ["relaySMTP.exe", 250],
  ["HTTPWorm.exe", 500],
  ["SQLInject.exe", 750],
];

// Create the first program it can.
export async function main(ns: NS) {
  ns.disableLog("ALL");
  for (const [program, level] of programs) {
    if (!ns.fileExists(program) && ns.getHackingLevel() >= level) {
      await createProgram(ns, program);
      break;
    }
  }
  if (
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.toLowerCase().includes("program")
  )
    ns.spawn("/phase1/nuke.js");
  else ns.spawn("/phase1/actions/findAug.js");
}

export async function createProgram(ns: NS, programName: string) {
  if (
    ns.fileExists(programName) &&
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.toLowerCase().includes("program") &&
    ns.getPlayer().createProgramName === programName
  ) {
    ns.singularity.stopAction();
    return;
  }
  if (
    !ns.singularity.isBusy() ||
    !ns.getPlayer().workType.toLowerCase().includes("program")
  ) {
    // ns.toast(ns.getPlayer().workType);
    ns.singularity.createProgram(programName);
  }
}
