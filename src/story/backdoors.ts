import { NS } from "Bitburner";
import { keys } from "consts";

const FactionData: {
  faction: string;
  server: string;
}[] = [
  {
    faction: "CyberSec",
    server: "CSEC",
  },
  {
    faction: "NiteSec",
    server: "avmnite-02h",
  },
  {
    faction: "The Black Hand",
    server: "I.I.I.I",
  },
  {
    faction: "BitRunners",
    server: "run4theh111z",
  },
  {
    faction: "Fulcrum Secret Technologies",
    server: "fulcrumassets",
  },
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script automatically tries to backdoor the main story line servers if you are not a member of their faction.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  while (true) {
    await ns.sleep(300);
    ns.clearLog();
    const { factions } = ns.getPlayer();
    const hackingLevel = ns.getHackingLevel();
    const portHacks = getPortHacks();
    for (const fd of FactionData) {
      if (factions.includes(fd.faction)) continue;

      if (
        ns.getServerRequiredHackingLevel(fd.server) > hackingLevel ||
        ns.getServerNumPortsRequired(fd.server) > portHacks
      ) {
        // can't backdoor the server
        ns.print(`
          cannot backdoor ${
            fd.server
          } because it needs ${ns.getServerNumPortsRequired(
          fd.server
        )} ports openned
          and ${ns.getServerRequiredHackingLevel(fd.server)} hacking level.
          `);
        continue;
      }

      // We can backdoor the server.
      // first make sure we have nuked everything!
      ns.run("/hacking/nukeAll.js");
      ns.run("/cnct.js", 1, fd.server);
      // make sure we are connected and nuked.
      while (
        ns.scriptRunning("/cnct.js", ns.getHostname()) ||
        ns.scriptRunning("/hacking/nukeAll.js", ns.getHostname())
      )
        await ns.sleep(1);

      ns.installBackdoor();
    }
  }
}

function getPortHacks(): number {
  const data = localStorage.getItem(keys.hackablePorts);
  if (!data) return 0;
  return JSON.parse(data);
}
