import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      This script will weaken a server until it is as weak as it can be.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  while (
    ns.getServerSecurityLevel(hostname) > ns.getServerMinSecurityLevel(hostname)
  ) {
    ns.clearLog();
    await ns.weaken(hostname);
  }

  ns.print(`${hostname} is weak and ripe for plunder`);
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
