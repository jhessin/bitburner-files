import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";

export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  for (const target of await getHackableServers(ns)) {
    ns.run("/advanced/batch.js", 1, target);
  }
}
