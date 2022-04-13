import { NS, Server } from "Bitburner";
import { getHackableServers } from "cnct";
import { prepBatch } from "batching/prepBatch";

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
  let richest: Server = getHackableServers(ns)[0];

  const hackScript = "hack.js";

  await prep(ns, richest.hostname);
  // await prepBatch(ns, richest.hostname);
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

async function prep(ns: NS, host: string) {
  // first soften her up.
  while (ns.getServerSecurityLevel(host) > ns.getServerMinSecurityLevel(host))
    await ns.weaken(host);

  // then grow her up
  while (ns.getServerMoneyAvailable(host) < ns.getServerMaxMoney(host)) {
    await ns.grow(host);
    // while continuing to soften.
    while (ns.getServerSecurityLevel(host) > ns.getServerMinSecurityLevel(host))
      await ns.weaken(host);
  }
}
