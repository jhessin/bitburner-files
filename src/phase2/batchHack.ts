import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

// - batchHack.js: This is your bread and butter batching script. It will calculate
//   the richest server that can be effectively hacked with the memory you have
//   available. Copy 'batch.js' to the source server and start a batch based
//   attack on the target server.

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
  const tree = new ServerTree(ns);

  // Step 1: Kill all scripts on remote servers.
  killAll(ns, tree);

  // Step 3: Find the richest server that we have enough memory to effectively
  // batch.
  const targetServer = await getTargetServer(ns, tree);

  // Step 4: start batching!
  if (!targetServer) {
    ns.tprint("Can't batch yet!");
    return;
  }

  ns.spawn("/batching/batch.js", 1, targetServer.hostname);
}

function killAll(ns: NS, tree: ServerTree) {
  for (const s of tree.home.list()) {
    if (s.hostname === ns.getHostname()) continue;
    ns.killall(s.hostname);
  }
}

async function getTargetServer(ns: NS, tree: ServerTree) {
  let bestServer: Server | undefined = undefined;
  for (const s of tree.home.filter(
    (s) => s.hasAdminRights && s.requiredHackingSkill <= ns.getHackingLevel()
  )) {
    if (!bestServer) {
      bestServer = s;
      continue;
    }
    if (bestServer.moneyMax < s.moneyMax) bestServer = s;
  }
  return bestServer;
}
