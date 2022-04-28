import { NS } from "Bitburner";
import { nuke } from "utils/nuke";
import { getNukableServers } from "cnct";

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

    nukeAll(ns);
  }
}

export async function nukeAll(ns: NS) {
  // find nukable servers.
  for (const server of getNukableServers(ns)) {
    // nuke them.
    ns.toast(`nuking ${server.hostname}`);
    nuke(ns, server.hostname);
    server.hasAdminRights = true;
  }
}
