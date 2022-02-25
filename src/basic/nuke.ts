import { NS } from "Bitburner";

export async function main(ns: NS) {
  let target = ns.args[0].toString();
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.tprint("Opening ssh port");
    ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.tprint("Opening ftp port");

    ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.tprint("Opening smtp port");

    ns.relaysmtp(target);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.tprint("Opening http port");
    ns.httpworm(target);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.tprint("Opening sql port");
    ns.sqlinject(target);
  }
  if (!ns.hasRootAccess(target)) {
    ns.nuke(target);
  }
}
