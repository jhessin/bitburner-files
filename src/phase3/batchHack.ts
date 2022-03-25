import { prepareServer } from "batching/batch";
import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

// - batchHack.js: This is your bread and butter batching script. It will calculate
//   the richest server that can be effectively hacked with the memory you have
//   available. Copy 'batch.js' to the source server and start a batch based
//   attack on the target server.

const spacerTime = 5000;
//
const spawnerScript = "/batching/spawner.js";
const hackScript = "/batching/hack.js";
const weakenScript = "/batching/weaken.js";
const growScript = "/batching/grow.js";
const batchScript = "/batching/batch.js";
const analyzeScript = "analyzeServer.js";

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

  // stop any previous batching.
  killall(ns, analyzeScript);
  killall(ns, spawnerScript);
  killall(ns, hackScript);
  await ns.sleep(spacerTime);
  killall(ns, growScript);
  await ns.sleep(spacerTime);
  killall(ns, weakenScript);

  // Find the richest server that we have enough memory to effectively
  // batch.
  const targetServer = await getTargetServer(ns, tree);

  // start batching!
  if (!targetServer) {
    ns.tprint("Can't batch yet!");
    return;
  }

  ns.tprint(`Hacking ${targetServer.hostname}`);
  ns.run(analyzeScript, 1, targetServer.hostname);
  ns.spawn(batchScript, 1, targetServer.hostname);
}

async function getTargetServer(ns: NS, tree: ServerTree) {
  // First we should prepare all the servers.
  for (const t of tree.home.filter(
    (s) =>
      s.hasAdminRights &&
      s.requiredHackingSkill <= ns.getHackingLevel() &&
      s.hostname !== "home" &&
      !ns.getPurchasedServers().includes(s.hostname) &&
      s.moneyMax > 0
  )) {
    ns.scriptKill(analyzeScript, ns.getHostname());
    ns.run(analyzeScript, 1, t.hostname);
    await prepareServer(ns, t.hostname);
  }

  let bestServer: Server | undefined = undefined;
  for (const s of tree.home.filter(
    (s) => s.hasAdminRights && s.requiredHackingSkill <= ns.getHackingLevel()
  )) {
    if (!bestServer) {
      bestServer = s;
      continue;
    }
    if (
      bestServer.moneyMax * ns.hackAnalyzeChance(bestServer.hostname) <
      s.moneyMax * ns.hackAnalyzeChance(s.hostname)
    )
      bestServer = s;
  }
  return bestServer;
}

function killall(ns: NS, script: string) {
  const tree = new ServerTree(ns);
  for (const s of tree.home.list().filter((s) => s.hasAdminRights)) {
    ns.scriptKill(script, s.hostname);
  }
}
