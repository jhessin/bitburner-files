import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      This script will grow a server until it's full.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  while (
    ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname)
  ) {
    ns.clearLog();
    await ns.grow(hostname);
  }
  ns.print("${hostname} is full of cash!");
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
