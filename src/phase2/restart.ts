import { NS } from "Bitburner";
import { getMinRam } from "purchase";
import { getHackableServers } from "cnct";
import { monitor } from "ui/monitor";
import { nukeAll } from "nuker";
import { installBackdoors } from "backdoor";
import { createPrograms } from "programs";
import { expandServer } from "expandServer";
import { factionWatch } from "factionWatch";
import { purchaseServers, upgradeServers } from "purchase";
import { expandHacknet } from "hacknet";
import { prepBatch } from "batching/prepBatch";
import { batch } from "batching/batch";
import { purchasePricey } from "actions/augmentations";
import { commitCrime } from "actions/crime";
import { manageStock } from "stocks/start";

// timing constants
// const second = 1000; //milliseconds
// const seconds = second;
// const minute = 60 * seconds;
// const minutes = minute;
// const hours = 60 * minutes;
// const hour = hours;
// const days = 24 * hours;
// const day = days;

const scripts = [
  "/contracts/start.js",
  //
];
const updateDuration = 30 * 60 * 1000;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This is a simple script that restarts the automated scripts periodically.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }
  for (const script of scripts) {
    ns.run(script);
    // This delay is to keep the scripts from colliding.
    await ns.sleep(5000);
  }
  let target = getHackableServers(ns)[0].hostname;
  let startTime = Date.now();

  async function updateHack() {
    target = getHackableServers(ns)[0].hostname;
    await prepBatch(ns, target);
    await batch(ns, target);
    startTime = Date.now();
  }
  await spendMoney(ns);
  await nukeAll(ns);
  await updateHack();

  while (true) {
    ns.clearLog();
    ns.tail();
    // Keep nuking servers
    await nukeAll(ns);
    // update hack target if necessary
    if (
      getHackableServers(ns)[0].hostname !== target &&
      Date.now() > startTime + updateDuration
    )
      await updateHack();
    // install backdoors and join any factions.
    await installBackdoors(ns);
    factionWatch(ns);
    await spendMoney(ns);
    monitor(ns);
    ns.print(
      `Possible update in ${ns.tFormat(
        startTime + updateDuration - Date.now()
      )}`
    );
    // If I'm not to busy commit a crime.
    await commitCrime(ns);
    const owned = ns.singularity.getOwnedAugmentations(true);
    let shouldInstall =
      ns.singularity.getOwnedAugmentations(false).length < owned.length;
    for (const faction of ns.getPlayer().factions) {
      for (const aug of ns.singularity
        .getAugmentationsFromFaction(faction)
        .filter((a) => !a.startsWith("NeuroFlux"))) {
        // if we don't have all augs don't install.
        if (!owned.includes(aug)) shouldInstall = false;
      }
    }
    if (shouldInstall) ns.singularity.installAugmentations("restart.js");
  }
}

async function spendMoney(ns: NS) {
  await purchasePricey(ns);
  // Buy or create any programs you may need.
  await createPrograms(ns);
  expandServer(ns);
  if (getMinRam(ns) < ns.getPurchasedServerMaxRam()) {
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
  }
  expandHacknet(ns);
  await manageStock(ns);
}
