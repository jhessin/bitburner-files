import { NS } from "Bitburner";
import { getRichestServer } from "advanced/richestServer";
import { getRunnableServers } from "lib/getall";
import { deployToAll as deploy } from "lib/deploy";

const bufferTime = 300;
export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  while (true) {
    ns.run("/advanced/nukeall.js");
    while (ns.scriptRunning("/advanced/nukeall.js", ns.getHostname()))
      await ns.sleep(1);
    const target = await getRichestServer(ns);
    for (const host of await getRunnableServers(ns)) {
      if (host === "home") continue;
      await deploy(ns, "/basic/early-hack.js", false, target[0]);
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
