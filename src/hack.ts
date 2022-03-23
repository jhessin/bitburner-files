import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      This script will prepare and then continuously hack a given server.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }
  let time = Date.now();

  // prepare
  async function prepare(host: string) {
    ns.print("Preparing the server.");
    while (ns.getServerMoneyAvailable(host) < ns.getServerMaxMoney(host))
      await ns.grow(host);
    while (ns.getServerSecurityLevel(host) > ns.getServerMinSecurityLevel(host))
      await ns.weaken(host);
    time = Date.now();
  }

  await prepare(hostname);

  // now HACK
  while (true) {
    ns.clearLog();
    await ns.hack(hostname);
    await ns.weaken(hostname);
    await ns.grow(hostname);
    await ns.weaken(hostname);
    // reprepare every 5 minutes.
    if (Date.now() - time > 5 * 60 * 1000) await prepare(hostname);
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
