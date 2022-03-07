import { NS } from "Bitburner";
import { getPlayerDetails } from "lib/getDetails";

export async function main(ns: NS) {
  await getAllServers(ns);
}

/** @param {NS} ns **/
export async function getAllServers(ns: NS) {
  let allServers: string[] = [];
  async function getServers(host: string | undefined = undefined) {
    let localServers = ns.scan(host);
    localServers = localServers.filter((s) => !allServers.includes(s));
    if (localServers.length === 0) return;
    for (let server of localServers) {
      if (!allServers.includes(server)) allServers.push(server);
      await ns.sleep(1);
      await getServers(server);
    }
  }
  await getServers();
  return allServers;
}

export async function getHackableServers(ns: NS) {
  let minCash = 1e3;
  let playerData = getPlayerDetails(ns);
  let servers = (await getAllServers(ns)).filter(
    (s) =>
      s !== "home" &&
      playerData.hackingLevel >= ns.getServerRequiredHackingLevel(s) &&
      ns.hasRootAccess(s) &&
      ns.getServerMaxMoney(s) > minCash &&
      ns.getServerMoneyAvailable(s) > 0
  );

  while (servers.length > 100) {
    minCash *= 1e3;
    servers = servers.filter((s) => ns.getServerMaxMoney(s) > minCash);
  }

  return servers;
}

export async function getNukableServers(ns: NS) {
  let playerData = getPlayerDetails(ns);
  return (await getAllServers(ns)).filter(
    (s) =>
      playerData.portHacks >= ns.getServerNumPortsRequired(s) &&
      !ns.hasRootAccess(s)
  );
}

export async function getRunnableServers(ns: NS) {
  return (await getAllServers(ns)).filter((s) => ns.hasRootAccess(s));
}
