import { NS } from "Bitburner";
import { nuke } from "utils/nuke";
import { ServerNode } from "utils/ServerTree";
import { ProgramData } from "utils/ProgramData";

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

  const programs = new ProgramData(ns);

  while (true) {
    // 30 seconds should be a perfectly reasonable update time.
    await ns.sleep(30000);
    let servers = new ServerNode(ns);

    // find nukable servers.
    for (const server of servers
      .list()
      .filter(
        (s) =>
          !s.hasAdminRights && s.numOpenPortsRequired <= programs.hackablePorts
      )) {
      // nuke them.
      ns.print(`nuking ${server.hostname}`);
      nuke(ns, server.hostname);
    }
    // clear the log.
    ns.clearLog();
    let backdoors = servers
      .list()
      .filter(
        (s) =>
          s.hasAdminRights &&
          !s.backdoorInstalled &&
          s.requiredHackingSkill < ns.getHackingLevel() &&
          s.hostname !== "home" &&
          !ns.getPurchasedServers().includes(s.hostname)
      );
    // show the log if we have servers to backdoor
    if (backdoors.length === 0) {
      ns.print("No servers require a backdoor at this time.");
      continue;
    }
    ns.tail();
    ns.print(`The following servers need to have the backdoor installed:`);
    ns.print(`==========================================================`);
    // find backdoorable servers.
    for (const server of backdoors) {
      // list them.
      ns.print(server.hostname);
    }
    ns.print(`==========================================================`);
  }
}
