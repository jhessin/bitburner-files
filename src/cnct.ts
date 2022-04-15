import { NS, AutocompleteData, Server } from "Bitburner";
// import { copyCmd, ServerTree, ProgramData } from "utils/index";
import { copyCmd } from "utils/terminal";
import { ServerNode, ServerTree } from "utils/ServerTree";
import { ProgramData } from "utils/ProgramData";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const target = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !target) {
    ns.tprint(`
      This script will connect you to any server regardless of location.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} TARGET_SERVER
      `);
    return;
  }

  let tree = new ServerTree(ns);

  let path = tree.home.find(target).map((name) => {
    if (name === "home") return "home;";
    else return `connect ${name};`;
  });
  copyCmd(ns, path.join(""));
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}

export function getNukableServers(ns: NS) {
  let programs = new ProgramData(ns);
  let tree = new ServerTree(ns);
  return tree.home.filter(
    (s) => !s.hasAdminRights && s.numOpenPortsRequired <= programs.hackablePorts
  );
}

// This returns all the servers that we can hack sorted by the amount of money
// we can make off them.
export function getHackableServers(ns: NS) {
  const tree = new ServerTree(ns);
  return tree.home
    .filter(
      (s) =>
        s.requiredHackingSkill <= ns.getHackingLevel() &&
        s.hasAdminRights &&
        s.hostname !== "home" &&
        !ns.getPurchasedServers().includes(s.hostname) &&
        s.moneyMax > 0
    )
    .sort((a, b) => {
      return getServerHackValue(ns, b) - getServerHackValue(ns, a);
    });
}

export function getBackdoorableServers(ns: NS) {
  let tree = new ServerTree(ns);
  return (
    tree.home.filter((s) => !s.backdoorInstalled && s.hasAdminRights) || []
  );
}

export function getRunnableServers(ns: NS) {
  const tree = new ServerNode(ns);
  return tree
    .list()
    .filter((s) => s.hasAdminRights)
    .sort((a, b) => b.maxRam - b.ramUsed - (a.maxRam - a.ramUsed));
}

function getServerHackValue(ns: NS, server: Server) {
  server.hackDifficulty = server.minDifficulty;
  const player = ns.getPlayer();
  return (
    (server.moneyMax *
      ns.formulas.hacking.hackChance(server, player) *
      ns.formulas.hacking.hackPercent(server, player) *
      ns.formulas.hacking.growPercent(server, 1, player)) /
    ns.formulas.hacking.hackTime(server, player) /
    ns.formulas.hacking.growTime(server, player) /
    ns.formulas.hacking.weakenTime(server, player)
  );
}
