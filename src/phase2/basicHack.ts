import { NS, Server } from "Bitburner";
import { getHackableServers, getRunnableServers } from "phase2/cnct";

export async function main(ns: NS) {
  ns.clearLog();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      Hacks the richest server from every available server.

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

  // copy the hack script to all the servers we have admin priveledges to.
  for (const server of getRunnableServers(ns)) {
    if (!server || server.hostname === "home") continue;
    ns.killall(server.hostname);
    const hackScript = "hack.js";
    await ns.scp(hackScript, server.hostname);
    // calculate the maximum number of threads.
    let maxThreads = Math.floor(
      server.maxRam / ns.getScriptRam(hackScript, server.hostname)
    );
    // hack the richest server
    if (maxThreads > 0)
      ns.exec(hackScript, server.hostname, maxThreads, richest.hostname);
  }
}
