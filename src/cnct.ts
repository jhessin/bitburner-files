import { NS, AutocompleteData } from "Bitburner";

function recursiveScan(
  ns: NS,
  parent: string,
  server: string,
  target: string,
  route: string[]
) {
  const children = ns.scan(server);
  for (let child of children) {
    if (parent == child) {
      continue;
    }
    if (child == target) {
      route.unshift(child);
      route.unshift(server);
      return true;
    }

    if (recursiveScan(ns, server, child, target, route)) {
      route.unshift(server);
      return true;
    }
  }
  return false;
}

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  let route: string[] = [];
  let server = args._[0];
  if (!server || args.help) {
    ns.tprint("This script helps you connect to any server on the network.");
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  if (!recursiveScan(ns, "", "home", server, route)) {
    ns.tprint(`Could not find server ${server}!`);
    return;
  }

  for (const i of route) {
    await ns.sleep(500);
    if (ns.serverExists(i)) ns.connect(i);
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
