import { NS, Server } from "Bitburner";
import { iFaction, keys } from "consts";

const workTypes = [
  "Hacking",
  "Field",
  "Security",
  //
];

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([
    ["help", false],
    ["goal", 0],
  ]);
  const faction = args._.join(" ");
  const targetRep = args.goal;
  if (args.help || !faction) {
    ns.tprint(`
      This program will grind reputation from a given faction using every available
      system's resources.

      Can optionally take a goal reputation to stop.
      USAGE: run ${ns.getScriptName()} [--goal=TARGET_REP] FACTION_NAME
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

  let workType: string | undefined;

  if (ns.isBusy()) ns.stopAction();
  while (
    targetRep === 0 ||
    ns.getFactionRep(faction) + ns.getPlayer().workRepGained < targetRep
  ) {
    await ns.sleep(500);
    ns.clearLog();
    ns.tail();
    ns.print(
      `Working for ${faction} until you have ${ns.nFormat(
        targetRep,
        "0.00a"
      )} rep.`
    );
    if (workType) {
      ns.print(`Doing ${workType} Work for ${faction}`);
    }
    if (!ns.isBusy()) {
      if (workType) {
        ns.workForFaction(faction, workType, false);
      } else if (!ns.workForFaction(faction, "Hacking", false)) {
        ns.print(`${faction} does not support hacking - trying Field Work.`);
        if (!ns.workForFaction(faction, "Field", false)) {
          ns.print(
            `${faction} does not support Field Work - trying Security Work.`
          );
          if (!ns.workForFaction(faction, "Security", false)) {
            ns.print(
              `What kind of faction is ${faction} that doesn't support anything!?!`
            );
          } else {
            workType = "Security";
            ns.print(`Doing Security Work for ${faction}`);
          }
        } else {
          workType = "Field";
          ns.print(`Doing Field Work for ${faction}`);
        }
      } else {
        workType = "Hacking";
        ns.print(`Doing Hacking Contracts for ${faction}`);
      }
    }
  }
  ns.stopAction();
}

export function autocomplete() {
  let data = localStorage.getItem(keys.factions);
  if (!data) return [];
  let factions: iFaction[] = JSON.parse(data);
  return factions.map((f) => f.name);
}