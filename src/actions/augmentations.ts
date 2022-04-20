import { NS } from "Bitburner";
import { commitCrime } from "actions/crime";
import { getFactionRepGoal, workForFaction } from "actions/factionWork";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const hostname = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !hostname) {
    ns.tprint(`
      ENTER YOUR SCRIPT DESCRIPTION HERE!

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }
}

export function priciestAug(ns: NS): string {
  const owned = ns.singularity.getOwnedAugmentations(true);
  let allAugs: string[] = [];
  for (const faction of ns.getPlayer().factions) {
    for (const aug of ns.singularity
      .getAugmentationsFromFaction(faction)
      .filter((a) => {
        if (owned.includes(a)) return false;
        for (const prereq of ns.singularity.getAugmentationPrereq(a)) {
          if (!owned.includes(prereq)) return false;
        }
        return true;
      })) {
      allAugs.push(aug);
    }
  }
  return allAugs.sort(
    (a, b) =>
      ns.singularity.getAugmentationPrice(b) -
      ns.singularity.getAugmentationPrice(a)
  )[0];
}

export async function farmRep(ns: NS) {
  for (const faction of ns.getPlayer().factions) {
    if (
      ns.singularity.getFactionRep(faction) < getFactionRepGoal(ns, faction)
    ) {
      await workForFaction(ns, faction);
    }
  }
}

export async function purchasePricey(ns: NS) {
  const targetAug = priciestAug(ns);
  ns.print(`target aug : ${targetAug}`);
  for (const faction of ns
    .getPlayer()
    .factions.sort(
      (a, b) =>
        ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a)
    )) {
    if (
      ns.singularity.getAugmentationsFromFaction(faction).includes(targetAug)
    ) {
      if (
        ns.singularity.getAugmentationRepReq(targetAug) >
        ns.singularity.getFactionRep(faction)
      ) {
        ns.print(`Need rep with ${faction}.`);
        await workForFaction(ns, faction);
      } else if (
        ns.getServerMoneyAvailable("home") >=
        ns.singularity.getAugmentationPrice(targetAug)
      ) {
        ns.print(`Purchasing ${targetAug} from ${faction}`);
        ns.singularity.purchaseAugmentation(faction, targetAug);
      } else {
        ns.print(`Commiting crime to afford ${targetAug} from ${faction}`);
        await commitCrime(ns);
      }
      break;
    }
  }
}
