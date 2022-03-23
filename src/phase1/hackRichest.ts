import { NS, Server } from "Bitburner";
import { getHackableServers, getRunnableServers } from "phase1/cnct";

export async function main(ns: NS) {
  ns.clearLog();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      Hacks the richest server using the rest of your RAM.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // find the richest server.
  let richest: Server | undefined = undefined;

  for (const server of getHackableServers(ns)) {
    if (!richest || richest.moneyMax < server.moneyMax) richest = server;
  }

  if (!richest) {
    ns.tprint(`ERROR! You don't have any servers!`);
    return;
  }

  const hackScript = "hack.js";
  // calculate the maximum number of threads.
  let maxThreads = Math.floor(
    (ns.getServerMaxRam(ns.getHostname()) -
      ns.getServerUsedRam(ns.getHostname()) +
      ns.getScriptRam(ns.getScriptName(), ns.getHostname())) /
      ns.getScriptRam(hackScript, ns.getHostname())
  );
  // hack the richest server
  if (maxThreads > 0) ns.spawn(hackScript, maxThreads, richest.hostname);
  else {
    ns.tprint("ERROR! Cannot spawn hack script. Out of memory.");
  }
}
