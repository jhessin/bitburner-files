import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      This script will continuously hack a given prepared server.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  // now HACK
  while (true) {
    ns.clearLog();
    await ns.hack(hostname);
    await ns.weaken(hostname);
    await ns.grow(hostname);
    await ns.weaken(hostname);
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
