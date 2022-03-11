import { NS } from "Bitburner";
import { getNukableServers } from "lib/getall";
import { getPlayerDetails } from "lib/getDetails";

export async function main(ns: NS) {
  const servers = await getNukableServers(ns);
  const player = getPlayerDetails(ns);

  ns.print(`You can hack through ${player.portHacks} ports.`);

  for (let server of servers) {
    ns.print(`Nuking ${server}!`);
    ns.run("/basic/nuke.js", 1, server);
    while (ns.scriptRunning("/basic/nuke.js", ns.getHostname()))
      await ns.sleep(1);
  }

  if (servers.length === 0) ns.print("No nukable servers found.");
  else ns.print("All servers nuked!");
}
