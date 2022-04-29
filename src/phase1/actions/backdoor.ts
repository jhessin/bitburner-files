import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  await installBackdoors(ns);
  ns.spawn("phase1/prepare.js");
}

async function installBackdoors(ns: NS) {
  const allServers = new ServerTree(ns).home.filter(
    (s) =>
      s.hostname !== "home" && !ns.getPurchasedServers().includes(s.hostname)
  );
  const serversBackdoored = allServers.filter((s) => s.backdoorInstalled);
  if (serversBackdoored.length === allServers.length) {
    ns.print(`
        ALL SERVERS HAVE BEEN BACKDOORED
        `);
    return;
  }
  let backdoors = allServers.filter(
    (s) =>
      s.hasAdminRights &&
      !s.backdoorInstalled &&
      s.requiredHackingSkill < ns.getHackingLevel()
  );
  ns.print(`
      ${serversBackdoored.length} of ${allServers.length.toPrecision(2)} servers
      have been backdoored.
      ${backdoors.length} servers
      are being backdoored.
      `);
  // show the log if we have servers to backdoor
  if (backdoors.length === 0) {
    return;
  }
  await bn4(ns, backdoors);
}

async function bn4(ns: NS, backdoors: Server[]) {
  const tree = new ServerTree(ns);
  for (const host of backdoors) {
    const path = tree.home.find(host.hostname);
    // go to the target
    for (const host of path) {
      ns.singularity.connect(host);
    }
    ns.enableLog("installBackdoor");
    ns.print(ns.tFormat(Date.now()));
    await ns.singularity.installBackdoor();
    // return home
    for (const host of path.reverse()) {
      ns.singularity.connect(host);
    }
  }
}
