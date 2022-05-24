import { NS } from "Bitburner";
import { getMinRam } from "purchase";
import { getHackableServers } from "cnct";
import { monitor, Daemon } from "ui/monitor";
import { nukeAll } from "nuker";
import { installBackdoors } from "backdoor";
import { createPrograms } from "programs";
import { expandServer } from "expandServer";
import { factionWatch } from "factionWatch";
import { purchaseServers, upgradeServers } from "purchase";
import { expandHacknet } from "hacknet";
import { batch } from "batching/batch";
import { purchasePricey, getMaxPrice } from "actions/augmentations";
import { manageStock } from "stocks/start";
import { liquidate } from "stocks/liquidate";
import { getNeededFactions } from "actions/factionHunt";
import { workForFaction } from "actions/factionWork";
import { commitCrime } from "actions/crime";
import { kill } from "utils/scriptKilling";

function getNextBitnode(ns: NS, addCurrent: boolean = true) {
  const bitnodePriorities: [number, number][] = [
    [1, 3], // Genesis
    [4, 3], // Singularity
    [5, 3], // Artificial Intelligence
    [3, 3], // Corporatocracy
    [6, 3], // Bladeburners
    [7, 3], // Bladeburners 2079
    [9, 3], // Hacktocracy
    [2, 3], // Rise of the Underworld
    [8, 3], // Ghost of Wall Street
    [10, 3], // Digital Carbon
    [11, 3], // The Big Crash
  ];

  const owned = ns.getOwnedSourceFiles();

  for (const sf of bitnodePriorities) {
    let sfFound = false;
    for (let { n, lvl } of owned) {
      if (addCurrent && n === ns.getPlayer().bitNodeN) lvl++;
      if (n === sf[0]) {
        sfFound = true;
        if (lvl < sf[1]) return sf[0];
      }
    }
    if (!sfFound) return sf[0];
  }

  return 12; // The Recursion
}

const scripts = [
  "/contracts/start.js",
  //
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  // phase 1 cleanup
  kill(ns, (proc) => proc.filename === "hack.js");

  for (const script of scripts) {
    ns.run(script);
  }
  await nukeAll(ns);
  let target = getHackableServers(ns)[0].hostname;

  async function updateHack() {
    target = getHackableServers(ns)[0].hostname;
    if (
      !ns.scriptRunning("/batching/batch.js", "home") &&
      !ns.run("/batching/batch.js", 1, target)
    )
      await batch(ns, target);
  }
  await work(ns);
  await nukeAll(ns);
  await updateHack();

  while (true) {
    if (
      ns.serverExists(Daemon) &&
      ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(Daemon)
    ) {
      ns.singularity.destroyW0r1dD43m0n(getNextBitnode(ns), "restart.js");
    }
    ns.clearLog();
    ns.tail();
    ns.print(`Current Bitnode: ${ns.getPlayer().bitNodeN}`);
    ns.print(`Next Bitnode: ${getNextBitnode(ns, true)}`);
    // Keep nuking servers
    await nukeAll(ns);
    // update hack target if necessary
    if (getHackableServers(ns)[0].hostname !== target) await updateHack();
    // install backdoors and join any factions.
    if (!ns.scriptRunning("backdoor.js", "home")) {
      if (!ns.run("backdoor.js")) await installBackdoors(ns);
    }
    if (!ns.scriptRunning("factionWatch.js", "home"))
      if (!ns.run("factionWatch.js")) factionWatch(ns);
    await work(ns);
    monitor(ns);
    await ns.sleep(1);
  }
}

async function work(ns: NS) {
  expandServer(ns);
  if (getMinRam(ns) < ns.getPurchasedServerMaxRam()) {
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
  }
  expandHacknet(ns);
  await manageStock(ns);
  const neededFactions = getNeededFactions(ns);
  // Buy or create any programs you may need or work to purchase pricey augs.
  if (!(await createPrograms(ns)))
    if (!(await purchasePricey(ns)))
      if (hasAugsToInstall(ns) && !(await stillGrowing(ns)))
        await finishOut(ns);
      else await neededFactions[0].workToJoin();
}

async function finishOut(ns: NS) {
  // check if we are at the end of the Bitnode
  if (
    ns.serverExists(Daemon) &&
    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(Daemon)
  ) {
    ns.singularity.destroyW0r1dD43m0n(getNextBitnode(ns), "restart.js");
  }

  // liquidate all stocks to start.
  await liquidate(ns);

  // first find the faction I have the most rep with.
  const targetFaction = ns
    .getPlayer()
    .factions.sort(
      (a, b) =>
        ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a)
    )[0];
  if (!targetFaction) return;

  while (true) {
    ns.clearLog();
    const neuroflux = ns.singularity
      .getAugmentationsFromFaction(targetFaction)
      .find((aug) => aug.startsWith("NeuroFlux"));
    if (!neuroflux) throw new Error("NeuroFlux Governor not found!");

    if (
      ns.singularity.getAugmentationRepReq(neuroflux) >
        ns.singularity.getFactionRep(targetFaction) ||
      ns.singularity.getAugmentationPrice(neuroflux) > getMaxPrice(ns)
    ) {
      if (hasAugsToInstall(ns))
        ns.singularity.installAugmentations("restart.js");
      else await workForFaction(ns, targetFaction);
    } else if (
      ns.singularity.getAugmentationPrice(neuroflux) <
      ns.getServerMoneyAvailable("home")
    )
      ns.singularity.purchaseAugmentation(targetFaction, neuroflux);
    else await commitCrime(ns);

    ns.print(`Finishing out by buying ${neuroflux} from ${targetFaction}`);
    await ns.sleep(1);
  }
}

function hasAugsToInstall(ns: NS) {
  return (
    ns.singularity.getOwnedAugmentations(true).length >
    ns.singularity.getOwnedAugmentations(false).length
  );
}

async function stillGrowing(ns: NS): Promise<boolean> {
  const samplingTime = 5000; // 2 Seconds
  let startLevel = ns.getHackingLevel();
  await ns.sleep(samplingTime);
  return startLevel !== ns.getHackingLevel();
}
