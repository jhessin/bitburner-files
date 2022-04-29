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
import { purchasePricey } from "actions/augmentations";
import { manageStock } from "stocks/start";
import { getNeededFactions } from "actions/factionHunt";
import { workForFaction } from "actions/factionWork";
import { commitCrime } from "actions/crime";
import { kill } from "utils/scriptKilling";

const nextBitnode = 4;

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
  await spendMoney(ns);
  await nukeAll(ns);
  await updateHack();

  while (true) {
    ns.clearLog();
    ns.tail();
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
    await spendMoney(ns);
    monitor(ns);
    await ns.sleep(1);
    // If I'm not to busy work for a company.
    const neededFactions = getNeededFactions(ns);
    if (!ns.singularity.isBusy() || ns.getPlayer().workType.includes("Company"))
      await neededFactions[0].workToJoin();
    if (!(await purchasePricey(ns)) && hasAugsToInstall(ns))
      await finishOut(ns);
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

async function finishOut(ns: NS) {
  // check if we are at the end of the Bitnode
  if (
    ns.serverExists(Daemon) &&
    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(Daemon)
  ) {
    ns.singularity.destroyW0r1dD43m0n(nextBitnode, "restart.js");
  }

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
      ns.singularity.getFactionRep(targetFaction)
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
