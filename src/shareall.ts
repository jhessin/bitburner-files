import { NS } from "Bitburner";
import { getRunnableServers } from "lib/getall";

export async function main(ns: NS) {
  for (const s of await getRunnableServers(ns)) {
    ns.run("/lib/deploy.js", 1, s, "/basic/share.js");
    await ns.sleep(1);
  }
}
