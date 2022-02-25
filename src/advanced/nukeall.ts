import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

const hackPrograms = [
  "BruteSSH.exe",
  "FTPCrack.exe",
  "relaySMTP.exe",
  "HTTPWorm.exe",
  "SQLInject.exe",
];

function getPlayerDetails(ns: NS) {
  let portHacks = 0;

  for (let hackProgram of hackPrograms) {
    if (ns.fileExists(hackProgram, "home")) {
      portHacks += 1;
    }
  }

  return {
    hackingLevel: ns.getHackingLevel(),
    portHacks,
  };
}

export async function main(ns: NS) {
  const servers = await getAllServers(ns);
  const player = getPlayerDetails(ns);

  // get all the nukeable servers
  let nukableServers: string[] = servers.filter(
    (s) =>
      ns.getServerNumPortsRequired(s) <= player.portHacks &&
      !ns.hasRootAccess(s)
  );

  for (let server of nukableServers) {
    ns.tprint(`Nuking ${server}!`);
    ns.run("/basic/nuke.js", 1, server);
  }

  if (nukableServers.length === 0) ns.tprint("No nukable servers found.");
  else ns.tprint("All servers nuked!");
}
