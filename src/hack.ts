import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  const host = (ns.args[0] as string) || ns.getHostname();
  // now HACK
  while (true) {
    ns.clearLog();
    await ns.hack(host);
    await ns.weaken(host);
    await ns.grow(host);
    await ns.weaken(host);
  }
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
