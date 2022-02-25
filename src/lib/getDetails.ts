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

  for (let hackProgram of hackPrograms) {
    if (ns.fileExists(hackProgram, "home")) {
      portHacks += 1;
    }
  }

  return {
    hackingLevel: ns.getHackingLevel(),
    portHacks,
  };
}
