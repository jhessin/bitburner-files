import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";
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
    const allServers = new ServerTree(ns).home.filter(
      (s) =>
        s.hostname !== "home" && !ns.getPurchasedServers().includes(s.hostname)
    );
    // clear the log.
    ns.clearLog();
    const serversBackdoored = allServers.filter((s) => s.backdoorInstalled);
    ns.print(`
      ||=====================||
      ||${serversBackdoored.length.toPrecision(
        2
      )} of ${allServers.length.toPrecision(2)} servers     ||
      ||have been backdoored.||
      ||=====================||
      `);
    if (serversBackdoored.length === allServers.length) {
      ns.clearLog();
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
    // show the log if we have servers to backdoor
    if (backdoors.length === 0) {
      ns.print("No servers require a backdoor at this time.");
      continue;
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

async function bn4(ns: NS, backdoors: Server[]) {
  const tree = new ServerTree(ns);
  for (const host of backdoors) {
    const path = tree.home.find(host.hostname);
    // go to the target
    for (const host of path) {
      ns.connect(host);
    }
    await ns.installBackdoor();
    // return home
    for (const host of path.reverse()) {
      ns.connect(host);
    }
  }
}
