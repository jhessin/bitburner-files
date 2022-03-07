import { NS } from "Bitburner";
import { getFastestServer } from "advanced/fastestServer";
import { getRunnableServers } from "lib/getall";
import { deployToAll as deploy } from "lib/deploy";

const bufferTime = 300;
export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  while (true) {
    const target = await getFastestServer(ns);
    for (const host of await getRunnableServers(ns)) {
      if (host === "home") continue;
      await deploy(ns, "/basic/early-hack.js", false, target);
      await ns.sleep(bufferTime);
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeRamCost()) {
      ns.upgradeHomeRam();
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeCoresCost()) {
      ns.upgradeHomeCores();
    }
    await ns.sleep(1e50);
  }
}
