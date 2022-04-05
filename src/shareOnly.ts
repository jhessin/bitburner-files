import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";
import { kill } from "utils/scriptKilling";

const serverPercent = 1;

const homeSingletons = [
  "hacknet.js",
  "contracts/start.js",
  "backdoor.js",
  ///
];

const homeReserve = [
  "cnct.js",
  "bkdr.js",
  ///
];

export async function main(ns: NS) {
  ns.clearLog();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      For sharing and only sharing.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // first kill everything else.
  kill(ns, (ps) => ps.filename !== ns.getScriptName());

  // run singleton scripts
  for (const script of homeSingletons) {
    ns.run(script);
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
        (server.maxRam * serverPercent - server.ramUsed - getReservedRam(ns)) /
          ns.getScriptRam(shareScript, server.hostname)
      ),
      1
    );
    // run the share script if possible.
    ns.exec(shareScript, server.hostname, maxThreads);
  }
}
function getReservedRam(ns: NS) {
  if (ns.getHostname() !== "home") return 0;
  return Math.max(...homeReserve.map((script) => ns.getScriptRam(script)));
}
