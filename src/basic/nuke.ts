import { NS } from "Bitburner";

export async function main(ns: NS) {
  let target = ns.args[0].toString();
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.print("Opening ssh port");
    ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.print("Opening ftp port");

    ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.print("Opening smtp port");

    ns.relaysmtp(target);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.print("Opening http port");
    ns.httpworm(target);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.print("Opening sql port");
    ns.sqlinject(target);
  }
  if (!ns.hasRootAccess(target)) {
    ns.nuke(target);
  }
}
