import { NS, Server } from "Bitburner";
import { keys } from "consts";

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

function getRichestServer(hackingLevel: number): Server | undefined {
  let servers = getServers();
  let richest: Server | undefined;
  for (const server of servers) {
    if (
      (!richest || richest.moneyMax < server.moneyMax) &&
      server.hasAdminRights &&
      server.requiredHackingSkill <= hackingLevel
    ) {
      richest = server;
    }
  }
  return richest;
}

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = getRichestServer(ns.getHackingLevel());
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      This script will generate money by hacking the richest server possible.
      It automatically finds the richest server that the user can hack.
      If you are seeing this message and didn't use the --help flag then
      you either haven't run the /utils/updateServers.ts script since you installed augmentations
      or you haven't nuked any servers yet.

      This script currently uses ${ns.nFormat(ram, "0.000b")} of RAM.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  await originalHack(ns, hostname.hostname);
}

async function originalHack(ns: NS, hostname: string) {
  while (true) {
    if (
      ns.getServerSecurityLevel(hostname) >
      ns.getServerMinSecurityLevel(hostname)
    ) {
      await ns.weaken(hostname);
    } else if (
      ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname)
    ) {
      await ns.grow(hostname);
    } else {
      await ns.hack(hostname);
    }
  }
}
