import { NS, Server } from "Bitburner";
import { keys } from "consts";

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script kills every script everywhere.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  for (const server of getServers()) {
    if (server.hostname === ns.getHostname()) continue;
    ns.killall(server.hostname);
  }

  ns.killall(ns.getHostname());
}
