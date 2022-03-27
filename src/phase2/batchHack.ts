import { prepareServer } from "batching/batch";
import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

// - batchHack.js: This is your bread and butter batching script. It will calculate
//   the richest server that can be effectively hacked with the memory you have
//   available. Copy 'batch.js' to the source server and start a batch based
//   attack on the target server.

const batchScript = "/batching/batch.js";
const analyzeScript = "analyzeServer.js";

function getHackServerFilter(ns: NS) {
  return function hackServerFilter(s: Server): boolean {
    return (
      s.hasAdminRights &&
      s.requiredHackingSkill <= ns.getHackingLevel() &&
      s.hostname !== "home" &&
      !ns.getPurchasedServers().includes(s.hostname) &&
      s.moneyMax > 0
    );
  };
}

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

  // Find the richest server that we have enough memory to effectively
  // batch.
  const targetServer = await getTargetServer(ns, tree);

  // start batching!
  if (!targetServer) {
    ns.tprint("Can't batch yet!");
    return;
  }

  ns.tprint(`Hacking ${targetServer.hostname}`);
  ns.spawn(batchScript, 1, targetServer.hostname);
}

async function getTargetServer(ns: NS, tree: ServerTree) {
  // if we have Formulas.exe use that instead of preparing.
  const formulas = ns.fileExists("Formulas.exe", "home");

  // First we should prepare all the servers.
  if (!formulas) {
    const hackServers = tree.home.filter(getHackServerFilter(ns));
    let count = 1;
    for (const t of hackServers) {
      ns.run(
        analyzeScript,
        1,
        t.hostname,
        `Preparing Server: ${count} of ${hackServers.length}`,
        true
      );
      await prepareServer(ns, t.hostname);
      count++;
      ns.scriptKill(analyzeScript, ns.getHostname());
    }
  }

  let bestServer: Server | undefined = undefined;
  for (const s of tree.home.filter(getHackServerFilter(ns))) {
    // if we are using formulas this matters.
    s.moneyAvailable = s.moneyMax;
    s.hackDifficulty = s.minDifficulty;

    if (!bestServer) {
      bestServer = s;
      continue;
    }

    // calculate the servers actual value.
    const bestServerValue =
      (bestServer.moneyMax * ns.hackAnalyzeChance(bestServer.hostname)) / // We want these to be high
      (formulas
        ? ns.formulas.hacking.hackTime(bestServer, ns.getPlayer())
        : ns.getHackTime(bestServer.hostname)); // We want these to be low.
    const serverValue =
      (s.moneyMax * ns.hackAnalyzeChance(s.hostname)) /
      (formulas
        ? ns.formulas.hacking.hackTime(s, ns.getPlayer())
        : ns.getHackTime(s.hostname));

    if (bestServerValue < serverValue) bestServer = s;
  }
  return bestServer;
}
