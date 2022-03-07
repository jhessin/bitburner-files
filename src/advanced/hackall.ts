import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";

const bufferTime = 300;
const minutesToCheck = 5;
export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  ns.disableLog("scan");
  ns.disableLog("getServerRequiredHackingLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("sleep");
  while (true) {
    for (const target of await getHackableServers(ns)) {
      if (ns.isRunning("/advanced/batch.js", "home", target)) continue;
      if (ns.run("/advanced/batch.js", 1, target)) await ns.sleep(bufferTime);
      else break;
    }
    await ns.sleep(minutesToCheck * 60 * 1000);
  }
}
