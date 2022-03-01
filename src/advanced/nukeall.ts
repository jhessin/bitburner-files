import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";
import { getPlayerDetails } from "lib/getDetails";

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
    ns.print(`Nuking ${server}!`);
    ns.run("/basic/nuke.js", 1, server);
  }

  if (nukableServers.length === 0) ns.print("No nukable servers found.");
  else ns.print("All servers nuked!");
}
