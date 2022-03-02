import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";

const bufferTime = 300;
export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  while (true) {
    for (const target of await getHackableServers(ns)) {
      if (ns.isRunning("/advanced/batch.js", "home", target)) continue;
      ns.run("/advanced/batch.js", 1, target);
      await ns.sleep(bufferTime);
    }
    await ns.sleep(1e50);
  }
}
