import { NS } from "Bitburner";

const hackPrograms = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "relaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

export function getPlayerDetails(ns: NS) {
  let portHacks = 0;
  let programming = false;

  for (let hackProgram of hackPrograms) {
    if (ns.fileExists(hackProgram, "home")) {
      portHacks += 1;
    } else {
      if (!programming) {
        // programming = ns.createProgram(hackProgram, true);
        // } else {
        // ns.purchaseTor();
        // ns.purchaseProgram(hackProgram);
      }
    }
  }

  return {
    hackingLevel: ns.getHackingLevel(),
    portHacks,
  };
}
