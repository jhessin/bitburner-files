import { NS } from "Bitburner";
import { shareAll } from "shareAll";

export async function main(ns: NS) {
  // Work for the given faction using the most expedient method (usually hacking)
  const faction = ns.args[0] as string;
  await workForFaction(ns, faction);
}

export async function workForFaction(ns: NS, faction: string) {
  const goal = getFactionRepGoal(ns, faction);
  await shareAll(ns);
  if (
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.toLowerCase().includes("faction") &&
    ns.getPlayer().currentWorkFactionName === faction
  ) {
    ns.print(`Max Rep : ${ns.nFormat(goal, "0.000a")}`);
    if (
      ns.singularity.getFactionRep(faction) + ns.getPlayer().workRepGained >=
      goal
    ) {
      ns.singularity.stopAction();
    }
    return;
  }

  if (ns.singularity.workForFaction(faction, "Hacking Contracts")) return;
  else if (ns.singularity.workForFaction(faction, "Field Work")) return;
  else if (ns.singularity.workForFaction(faction, "Security Work")) return;
  else ns.tprint(`ERROR! ${faction} does not offer any work!`);
}

export function getFactionRepGoal(ns: NS, faction: string): number {
  const owned = ns.singularity.getOwnedAugmentations(true);
  let highestRep = 0;
  for (const aug of ns.singularity
    .getAugmentationsFromFaction(faction)
    .filter((a) => !owned.includes(a))) {
    const rep = ns.singularity.getAugmentationRepReq(aug);
    if (rep > highestRep) highestRep = rep;
  }
  return highestRep;
}
