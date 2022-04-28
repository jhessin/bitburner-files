import { NS } from "Bitburner";
import { getUninstalledAugs } from "actions/factionHunt";

export async function main(ns: NS) {
  let hackingXP = 0;
  let hackingLevel = 0;
  for (const aug of getUninstalledAugs(ns)) {
    let data = ns.singularity.getAugmentationStats(aug);
    hackingLevel *= data.hacking_mult || 1;
    hackingXP *= data.hacking_exp_mult || 1;
  }

  ns.tprint(`Unclaimed Hacking XP multiplier    : ${hackingXP}`);
  ns.tprint(`Unclaimed Hacking Level multiplier : ${hackingLevel}`);
}
