import { NS } from "Bitburner";
import { getRunnableServers } from "phase1/cnct";

export async function main(ns: NS) {
  ns.clearLog();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      Shares all the servers possible.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // copy the share script to all the servers we have admin priveledges to.
  for (const server of getRunnableServers(ns)) {
    if (!server || server.hostname === "home") continue;
    ns.killall(server.hostname);
    const shareScript = "share.js";
    await ns.scp(shareScript, server.hostname);
    // calculate the maximum number of threads.
    let maxThreads = Math.floor(
      server.maxRam / ns.getScriptRam(shareScript, server.hostname)
    );
    // hack the richest server
    if (maxThreads > 0) ns.exec(shareScript, server.hostname, maxThreads);
  }
}
