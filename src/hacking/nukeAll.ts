import { NS, Server } from "Bitburner";
import { keys, PortHackPrograms } from "consts";

function getServers(): Server[] {
  const data = localStorage.getItem(keys.serverList);
  if (!data) return [];
  return JSON.parse(data);
}

function getHackablePorts(): number {
  const data = localStorage.getItem(keys.hackablePorts);
  if (!data) return 0;
  return JSON.parse(data);
}

function getNukableServers() {
  return getServers().filter(
    (s) => !s.hasAdminRights && s.numOpenPortsRequired <= getHackablePorts()
  );
}

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will nuke all servers possible.

      This script currently uses ${ns.nFormat(ram, "0.000b")} of RAM.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  nukeAllServers(ns);
}

function nukeAllServers(ns: NS) {
  const servers = getNukableServers();

  for (const host of servers) {
    for (const program of PortHackPrograms) {
      if (ns.fileExists(program)) ns.exec(program, host.hostname);
    }
    ns.exec("NUKE.exe", host.hostname);
  }
}
