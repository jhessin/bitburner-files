import { NS } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      List the top 5 most expensive augmentations from your factions.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} 
      `);
    return;
  }

  const { factions } = ns.getPlayer();

  let augs: { aug: string; faction: string; price: number }[] = [];

  for (const faction of factions) {
    for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
      augs.push({
        aug,
        faction,
        price: ns.singularity.getAugmentationPrice(aug),
      });
    }
  }

  augs = augs.sort((a, b) => b.price - a.price).slice(undefined, 5);

  ns.tprint("Most Expensive Augmentations:");
  ns.tprint("=============================");
  for (const aug of augs) {
    ns.tprint(
      `(${aug.aug})
      ${aug.faction}
      ${ns.nFormat(aug.price, "$0.0a")}`
    );
  }
}
