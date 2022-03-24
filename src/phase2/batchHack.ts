import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

// - batchHack.js: This is your bread and butter batching script. It will calculate
//   the richest server that can be effectively hacked with the memory you have
//   available. Copy 'batch.js' to the source server and start a batch based
//   attack on the target server.
const hackScript = "/batching/hack.js";
const growScript = "/batching/grow.js";
const weakenScript = "/batching/weaken.js";

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

  // Step 2: Find the server with the most free memory.
  const hostServer = getHostServer(ns, tree);

  // Step 3: Find the richest server that we have enough memory to effectively
  // batch.
  const targetServer = await getTargetServer(ns, tree, hostServer);

  // Step 4: start batching!
  if (!targetServer) {
    ns.tprint("Can't batch yet!");
    return;
  }

  ns.spawn("/batching/batch.js", 1, hostServer.hostname, targetServer.hostname);
}

function killAll(ns: NS, tree: ServerTree) {
  for (const s of tree.home.list()) {
    if (s.hostname === ns.getHostname()) continue;
    ns.killall(s.hostname);
  }
}

function getHostServer(_ns: NS, tree: ServerTree) {
  let bestServer: Server = tree.home.data;
  for (const s of tree.home.filter((s) => s.hasAdminRights)) {
    if (s.maxRam - s.ramUsed > bestServer.maxRam - bestServer.ramUsed) {
      bestServer = s;
    }
  }
  return bestServer;
}

async function getTargetServer(ns: NS, tree: ServerTree, host: Server) {
  let bestServer: Server | undefined = undefined;
  for (const s of tree.home.filter(
    (s) => s.hasAdminRights && s.requiredHackingSkill <= ns.getHackingLevel()
  )) {
    // find how much ram is required to batch hack this server.
    const ram = await ramUsed(ns, host, s);
    // check if the host server has that much available.
    if (host.maxRam - host.ramUsed < ram) continue;
    // check if this server is better than the best.
    if (!bestServer) {
      bestServer = s;
      continue;
    }
    if (bestServer.moneyMax < s.moneyMax) bestServer = s;
  }
  return bestServer;
}

async function ramUsed(ns: NS, hostServer: Server, targetServer: Server) {
  // this calculates the ram used to batch hack the target server.
  const target = targetServer.hostname;
  // now find the required number of threads for each action.
  const growThreads = Math.ceil(
    ns.growthAnalyze(target, 2, hostServer.cpuCores)
  );
  const hackThreads = Math.ceil(0.5 / ns.hackAnalyze(target));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);
  const hackSecurityDelta = ns.hackAnalyzeSecurity(hackThreads);

  if (growSecurityDelta + hackSecurityDelta === Infinity) return Infinity;

  let weakenThreads = 0;
  while (
    ns.weakenAnalyze(weakenThreads, hostServer.cpuCores) <
    growSecurityDelta + hackSecurityDelta
  ) {
    await ns.sleep(1);
    weakenThreads += 1;
    ns.clearLog();
    ns.print(`Host server: ${hostServer.hostname}`);
    ns.print("Calculating Weaken Threads");
    ns.print(
      `${weakenThreads} threads will cut security by ${ns.weakenAnalyze(
        weakenThreads,
        hostServer.cpuCores
      )}`
    );
    ns.print(`Target security is ${growSecurityDelta + hackSecurityDelta}`);
  }

  // Calculate the amount of memory required
  return (
    hackThreads * ns.getScriptRam(hackScript) +
    growThreads * ns.getScriptRam(growScript) +
    weakenThreads * ns.getScriptRam(weakenScript)
  );
}
