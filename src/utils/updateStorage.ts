import { NS, Server } from "Bitburner";
import { iFaction, keys, PortHackPrograms } from "consts";

let servers: Server[] = [];

function recursiveScan(
  ns: NS,
  parent: string = "home",
  server: string = "home"
) {
  const children = ns.scan(server);
  if (!servers.map((s) => s.hostname).includes(server))
    servers.push(ns.getServer(server));
  for (let child of children) {
    if (parent == child) {
      continue;
    }
    recursiveScan(ns, server, child);
  }
}

/**
 * Get server data and save it to localStorage.
 */
function getServers(ns: NS) {
  recursiveScan(ns);
  localStorage.setItem(keys.serverList, JSON.stringify(servers));
}

/**
 * Get the number of ports the user can hack and store it in localStorage.
 */
function getPorts(ns: NS) {
  // get the ports
  let ports = 0;
  let programs = PortHackPrograms;
  for (const p of programs) {
    if (ns.fileExists(p)) ports++;
  }
  localStorage.setItem(keys.hackablePorts, JSON.stringify(ports));
}

/**
 * Get the users installed and purchased augmentations
 */
function getAugs(ns: NS) {
  let allAugs = ns.getOwnedAugmentations(true);
  let installedAugs = ns.getOwnedAugmentations(false);
  let queuedAugs = allAugs.filter((a) => !installedAugs.includes(a));

  localStorage.setItem(keys.augmentationsQueued, JSON.stringify(queuedAugs));
  localStorage.setItem(
    keys.augmentationsInstalled,
    JSON.stringify(installedAugs)
  );
}

/**
 * Get the factions the player belongs to and store them.
 */
function getFactions(ns: NS) {
  let factions = ns.getPlayer().factions;
  let data: iFaction[] = factions.map((f) => ({
    name: f,
    rep: ns.getFactionRep(f),
    favor: ns.getFactionFavor(f),
    augs: ns
      .getAugmentationsFromFaction(f)
      .map((a) => ns.getAugmentationStats(a)),
  }));
  localStorage.setItem(keys.factions, JSON.stringify(data));
}

/** Get the source files owned by the player */
function getSourceFiles(ns: NS) {
  let sourceFiles = ns.getOwnedSourceFiles();

  localStorage.setItem(keys.sourceFiles, JSON.stringify(sourceFiles));
}

/**
 * The main entry point for the program.
 */
export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(`
      This script will update the list of servers on the network as well as some other player data for use in other scripts. It should be run regularly to ensure accurate data in other scripts.

      Usage: run ${ns.getScriptName()}
      `);
    return;
  }
  getServers(ns);
  getPorts(ns);
  getFactions(ns);
  getAugs(ns);
  getSourceFiles(ns);
}
