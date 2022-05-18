import { NS } from "Bitburner";
import { etaCalculator } from "utils/etaCalculator";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const targetAug = ns.args[0] as string;
  purchaseAug(ns, targetAug);
  ns.spawn("/phase1/nuke.js");
}

function purchaseAug(ns: NS, targetAug: string): boolean {
  if (!targetAug) return false;
  const faction = ns
    .getPlayer()
    .factions.sort(
      (a, b) =>
        ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a)
    )
    .find((f) =>
      ns.singularity.getAugmentationsFromFaction(f).includes(targetAug)
    );
  if (!faction) {
    ns.spawn("/phase1/actions/factionHunt.js");
    return false;
  }
  if (
    ns.singularity.getAugmentationRepReq(targetAug) >
    ns.singularity.getFactionRep(faction)
  ) {
    // need rep with {faction}
    if (
      ns.singularity.isBusy() &&
      ns.getPlayer().workType.includes("Faction") &&
      ns.getPlayer().currentWorkFactionName === faction
    ) {
      // already working for the faction
      // Print ETA
      const totalRep =
        ns.singularity.getFactionRep(faction) + ns.getPlayer().workRepGained;
      const goal = ns.singularity.getAugmentationRepReq(targetAug);
      const ETA = ((goal - totalRep) / ns.getPlayer().workRepGainRate) * 200;
      ns.clearLog();
      ns.tail();
      ns.print(`ETA   : ${ns.tFormat(ETA)}`);
      ns.print(`ETA   : ${etaCalculator(ns, ETA)}`);
      if (totalRep >= goal) ns.singularity.stopAction();
    } else ns.spawn("/phase1/actions/factionWork.js", 1, faction);
  } else if (
    ns.getServerMoneyAvailable("home") >=
    ns.singularity.getAugmentationPrice(targetAug)
  ) {
    // have enough rep and cash
    ns.singularity.purchaseAugmentation(faction, targetAug);
  } else {
    // have enough rep but not enough cash
    ns.spawn(
      "/phase1/actions/crime.js",
      1,
      ns.singularity.getAugmentationPrice(targetAug).toString()
    );
  }
  return true;
}
