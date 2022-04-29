import { NS } from "Bitburner";

export async function main(ns: NS) {
  const aug = priciestAug(ns);
  if (!aug) ns.spawn("phase1/actions/factionHunt.js");
  else ns.spawn("/phase1/actions/purchaseAug.js", 1, aug);
}

function priciestAug(
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
  return allAugs.sort(
    (a, b) =>
      ns.singularity.getAugmentationPrice(b) -
      ns.singularity.getAugmentationPrice(a)
  )[0];
}

function getMaxPrice(ns: NS) {
  // this is the minimum max price. If we have more in our bank we will use that
  // instead.
  let min = 10_000_000_000;
  if (
    ns.singularity.getOwnedAugmentations(true).length -
      ns.singularity.getOwnedAugmentations(false).length ===
    0
  )
    min = Infinity;
  return Math.max(ns.getServerMoneyAvailable("home"), min);
}
