import { NS } from "Bitburner";
import { getRichestServer } from "advanced/richestServer";
import { getRunnableServers } from "lib/getall";

const bufferTime = 300;
export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  while (true) {
    const target = await getRichestServer(ns);
    for (const host of await getRunnableServers(ns)) {
      if (host === "home") continue;
      ns.run("/lib/deploy.js", 1, host, "/basic/early-hack.js", target[0]);
      await ns.sleep(bufferTime);
    }
    if (ns.isRunning("/advanced/batch.js", "home", target[0])) continue;
    ns.run("/advanced/batch.js", 1, target[0]);
    await ns.sleep(1e50);
  }
}
