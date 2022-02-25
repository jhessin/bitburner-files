import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

export async function main(ns: NS) {
  const servers = await getAllServers(ns);
  for (const server of servers) {
    ns.tprint(server);
  }
}
