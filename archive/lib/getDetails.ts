import { NS } from "Bitburner";

const hackPrograms = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "relaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

const programRequirements = [50, 100, 250, 500, 750];

export function getPlayerDetails(ns: NS) {
  let portHacks = 0;
  const hackingLevel = ns.getHackingLevel();

  for (const i in hackPrograms) {
    const hackProgram = hackPrograms[i];
    const levelReq = programRequirements[i];
    if (ns.fileExists(hackProgram, "home")) {
      portHacks += 1;
    } else {
      if (!ns.isBusy() && hackingLevel >= levelReq) {
        ns.createProgram(hackProgram, false);
      } else {
        ns.purchaseTor();
        ns.purchaseProgram(hackProgram);
      }
    }
  }

  return {
    hackingLevel,
    portHacks,
  };
}