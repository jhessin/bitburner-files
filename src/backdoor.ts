import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";
import { Daemon } from "ui/monitor";
import { bkdr } from "bkdr";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will monitor for servers that need a backdoor installed.
      It will also nuke any server that needs it.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  while (true) {
    await ns.sleep(1);
    ns.clearLog();

    // find nukable servers.
    if (!ns.scriptRunning("nuker.js", "home")) ns.run("nuker.js");
    await installBackdoors(ns);
  }
}

export async function installBackdoors(ns: NS) {
  const allServers = new ServerTree(ns).home.filter(
    (s) =>
      s.hostname !== "home" &&
      !ns.getPurchasedServers().includes(s.hostname) &&
      s.hostname !== Daemon
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
  if (
    ns
      .getOwnedSourceFiles()
      .map((sf) => sf.n)
      .includes(4) ||
    ns.getPlayer().bitNodeN === 4
  ) {
    await bn4(ns, backdoors);
  } else await noBn4(ns, backdoors);
}

async function noBn4(ns: NS, backdoors: Server[]) {
  ns.tail();
  ns.print(`Backdoor the following servers:`);
  ns.print(`===============================`);
  // find backdoorable servers.
  for (const server of backdoors) {
    // list them.
    ns.print(server.hostname);
    await bkdr(ns, server.hostname);
  }
  ns.print(`===============================`);
}

export async function bn4(ns: NS, backdoors: Server[]) {
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
