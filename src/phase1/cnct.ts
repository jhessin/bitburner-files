import { NS, AutocompleteData } from "Bitburner";
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
  // first copy the cnct.ts script to all the servers if necessary
  for (const s of tree.home.list()) {
    if (!ns.fileExists(ns.getScriptName(), s.hostname))
      await ns.scp(ns.getScriptName(), s.hostname);
  }

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

// This returns all the servers that we can hack.
export function getHackableServers(ns: NS) {
  const tree = new ServerNode(ns);
  return tree.filter(
    (s) => s.requiredHackingSkill <= ns.getHackingLevel() && s.hasAdminRights
  );
}

export function getBackdoorableServers(ns: NS) {
  let tree = new ServerTree(ns);
  return (
    tree.home.filter((s) => !s.backdoorInstalled && s.hasAdminRights) || []
  );
}

export function getRunnableServers(ns: NS) {
  const tree = new ServerNode(ns);
  return tree.list().filter((s) => s.hasAdminRights);
}
