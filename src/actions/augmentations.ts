import { NS } from "Bitburner";
import { commitCrime } from "actions/crime";
import { getFactionRepGoal, workForFaction } from "actions/factionWork";
import { etaCalculator } from "utils/etaCalculator";

const highPriority = [
  "CashRoot Starter Kit",
  "Neuroreceptor Management Implant",
  //
];

const lowPriority = [
  "The Red Pill",
  //
];

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

export function priciestAug(
  ns: NS,
  cap: number = getMaxPrice(ns)
): string | undefined {
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
        if (ns.singularity.getAugmentationPrice(a) > cap) return false;
        return true;
      })) {
      allAugs.push(aug);
    }
  }

  function augValue(aug: string) {
    // special conditions
    if (highPriority.includes(aug)) return Infinity;
    if (lowPriority.includes(aug)) return 0;

    const stats = ns.singularity.getAugmentationStats(aug);
    let multiplier = 1;
    if (stats.faction_rep_mult) multiplier += 1e9 * stats.faction_rep_mult;
    // if (stats.hacking_money_mult) multiplier += 1e3 * stats.hacking_money_mult;
    // if (stats.crime_money_mult) multiplier += 1e3 * stats.crime_money_mult;
    // if (stats.hacking_mult) multiplier += 1e3 * stats.hacking_mult;
    // if (stats.hacking_exp_mult) multiplier += 1e3 * stats.hacking_exp_mult;
    // if (stats.company_rep_mult) multiplier += 1e2 * stats.company_rep_mult;
    // return (1 / ns.singularity.getAugmentationRepReq(aug) || 1) * multiplier;
    return (
      ns.singularity.getAugmentationPrice(aug) * multiplier
      // ns.singularity.getAugmentationRepReq(aug) || 1
    );
  }

  return allAugs.sort((a, b) => augValue(b) - augValue(a))[0];
}

export async function farmRep(ns: NS) {
  for (const faction of ns.getPlayer().factions) {
    if (
      !ns.singularity.isBusy() &&
      ns.singularity.getFactionRep(faction) < getFactionRepGoal(ns, faction)
    ) {
      await workForFaction(ns, faction);
    }
  }
}

export async function purchasePricey(ns: NS): Promise<boolean> {
  // if
  const targetAug = priciestAug(ns);
  if (!targetAug) return false;
  ns.print(`target aug : ${targetAug}`);
  ns.print(
    `rep needed : ${ns.nFormat(
      ns.singularity.getAugmentationRepReq(targetAug),
      "0.000a"
    )}`
  );
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
        if (
          ns.singularity.isBusy() &&
          ns.getPlayer().workType.includes("Faction") &&
          ns.getPlayer().currentWorkFactionName === faction
        ) {
          const totalRep =
            ns.singularity.getFactionRep(faction) +
            ns.getPlayer().workRepGained;
          const goal = ns.singularity.getAugmentationRepReq(targetAug);
          const ETA =
            ((goal - totalRep) / ns.getPlayer().workRepGainRate) * 200;
          ns.print(`ETA   : ${ns.tFormat(ETA)}`);
          ns.print(`ETA   : ${etaCalculator(ns, ETA)}`);
          if (totalRep >= goal) ns.singularity.stopAction();
        } else if (
          !ns.singularity.isBusy() ||
          // If we are working for a company stop for this.
          !ns.getPlayer().workType.toLowerCase().includes("Program")
        )
          await workForFaction(ns, faction);
      } else if (
        ns.getServerMoneyAvailable("home") >=
        ns.singularity.getAugmentationPrice(targetAug)
      ) {
        ns.print(`Purchasing ${targetAug} from ${faction}`);
        ns.singularity.purchaseAugmentation(faction, targetAug);
      } else {
        const price = ns.singularity.getAugmentationPrice(targetAug);
        // ns.print(`Commiting crime to afford ${targetAug} from ${faction}`);
        ns.print(`Need ${ns.nFormat(price, "$0.0a")} to purchase ${targetAug}`);
        await commitCrime(ns, undefined, price);
      }
      break;
    }
  }
  return true;
}

export function getMaxPrice(ns: NS) {
  // this is the minimum max price. If we have more in our bank we will use that
  // instead.
  let min = 10_000_000;
  if (
    ns.singularity.getOwnedAugmentations(true).length ===
    ns.singularity.getOwnedAugmentations(false).length
  )
    min = Infinity;
  return Math.max(
    ns.getServerMoneyAvailable("home"), // + ns.getScriptIncome()[0] * 60,
    min
  );
}
