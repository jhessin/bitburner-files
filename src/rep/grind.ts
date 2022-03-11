import { NS, Server } from "Bitburner";
import { iFaction, keys } from "consts";

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const faction = args._.join(" ");
  if (args.help || !faction) {
    ns.tprint(`
      This program will grind reputation from a given faction using every available
      system's resources.
      USAGE: run ${ns.getScriptName()} FACTION_NAME
      `);
    return;
  }

  let servers = getServers();
  let { factions } = ns.getPlayer();

  if (!factions.includes(faction)) {
    ns.tprint(`You are not a member of ${faction}`);
  }

  for (const server of servers) {
    const host = server.hostname;
    if (host === "home") continue;
    ns.killall(host);
    await ns.scp("/remote/share.js", host);
    ns.exec("/remote/share.js", host);
    await ns.sleep(1);
  }
  if (ns.isBusy()) ns.stopAction();
  while (true) {
    await ns.sleep(500);
    if (!ns.isBusy()) {
      if (!ns.workForFaction(faction, "Hacking")) {
        ns.tprint(`${faction} does not support hacking - trying Field Work.`);
        if (!ns.workForFaction(faction, "Field")) {
          ns.tprint(
            `${faction} does not support Field Work - trying Security Work.`
          );
          if (!ns.workForFaction(faction, "Security")) {
            ns.tprint(
              `What kind of faction is ${faction} that doesn't support anything!?!`
            );
          } else {
            ns.tprint(`Doing Security Work for ${faction}`);
          }
        } else {
          ns.tprint(`Doing Field Work for ${faction}`);
        }
      } else {
        ns.tprint(`Doing Hacking Contracts for ${faction}`);
      }
    }
  }
}

export function autocomplete() {
  let data = localStorage.getItem(keys.factions);
  if (!data) return [];
  let factions: iFaction[] = JSON.parse(data);
  return factions.map((f) => f.name);
}
