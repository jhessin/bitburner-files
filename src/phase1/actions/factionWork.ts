import { NS } from "Bitburner";

const workTypes = ["Hacking Contracts", "Field Work", "Security Work"];

export async function main(ns: NS) {
  // Work for the given faction using the most expedient method (usually hacking)
  const faction = ns.args[0] as string;
  if (
    ns.singularity.isBusy() &&
    ns.getPlayer().workType.includes("Faction") &&
    ns.getPlayer().currentWorkFactionName === faction
  ) {
    if (
      ns.getPlayer().workRepGained + ns.singularity.getFactionRep(faction) >=
      getFactionRepGoal(ns, faction)
    )
      ns.singularity.stopAction();
  } else await workForFaction(ns, faction);

  ns.spawn("/phase1/nuke.js");
}

export async function workForFaction(ns: NS, faction: string) {
  const goal = getFactionRepGoal(ns, faction);
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

  for (const workType of workTypes) {
    if (ns.singularity.workForFaction(faction, workType)) return;
  }

  ns.toast(`ERROR! ${faction} does not offer any work!`);
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
