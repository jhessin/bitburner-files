import { NS, Server } from "Bitburner";
import { getHackableServers } from "cnct";

// - batchHack.js: This is your bread and butter batching script. It will calculate
//   the richest server that can be effectively hacked with the memory you have
//   available. Copy 'batch.js' to the source server and start a batch based
//   attack on the target server.

const batchScript = "/batching/batch.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will start your batch hacking.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // Find the richest server that we have enough memory to effectively
  // batch.
  const targetServers = getTargetServers(ns);

  // start batching!
  if (!targetServers || targetServers.length === 0) {
    ns.tprint("Can't batch yet!");
    return;
  }

  for (const targetServer of targetServers) {
    ns.tprint(`Hacking ${targetServer.hostname}`);
    ns.run(batchScript, 1, targetServer.hostname);
  }
}

function getTargetServers(ns: NS): Server[] {
  const numServers = ns.getPurchasedServers().length + 1;
  // const numServers = 1;

  return getHackableServers(ns).slice(0, numServers);
}
