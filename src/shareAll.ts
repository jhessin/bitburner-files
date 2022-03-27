import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";

const serverPercent = 0.75;

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
    // if (!server || server.hostname === "home") continue;
    if (!server) continue;
    const shareScript = "share.js";
    await ns.scp(shareScript, server.hostname);
    // calculate the maximum number of threads.
    server.ramUsed = ns.getServerUsedRam(server.hostname);
    let maxThreads = Math.max(
      Math.floor(
        (server.maxRam * serverPercent - server.ramUsed) /
          ns.getScriptRam(shareScript, server.hostname)
      ),
      1
    );
    // run the share script if possible.
    ns.exec(shareScript, server.hostname, maxThreads);
  }
}
