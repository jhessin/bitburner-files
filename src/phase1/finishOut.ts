import { NS } from "Bitburner";

export async function main(ns: NS) {
  await finishOut(ns);
}

async function finishOut(ns: NS) {
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
      ns.singularity.installAugmentations("restart.js");
    } else if (
      ns.singularity.getAugmentationPrice(neuroflux) <
      ns.getServerMoneyAvailable("home")
    )
      ns.singularity.purchaseAugmentation(targetFaction, neuroflux);

    ns.print(`Finishing out by buying ${neuroflux} from ${targetFaction}`);
    await ns.sleep(1);
  }
}

export function getMaxPrice(ns: NS) {
  // this is the minimum max price. If we have more in our bank we will use that
  // instead.
  let min = 10_000_000;
  if (
    ns.singularity.getOwnedAugmentations(true).length -
      ns.singularity.getOwnedAugmentations(false).length ===
    0
  )
    min = Infinity;
  return Math.max(
    ns.getServerMoneyAvailable("home") + ns.getScriptIncome()[0] * 60,
    min
  );
}
