import { NS } from "Bitburner";
import { GM } from "gameManager/earlyGM";

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
  const gm = new GM(ns);
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
    for (const fd of FactionData) {
      if (factions.includes(fd.faction)) continue;
      await gm.backdoor(fd.server);
    }
  }
}
