import { NS } from "Bitburner";
import { getPlayerDetails } from "lib/getDetails";
import { home } from "advanced/cnct.js";

export async function main(ns: NS) {
  while (true) {
    const { hackingLevel, portHacks } = getPlayerDetails(ns);
    const { factions } = ns.getPlayer();

    if (
      hackingLevel >= 56 &&
      portHacks >= 1 &&
      !factions.includes("CyberSec")
    ) {
      ns.run("/basic/nuke.js", 1, "CSEC");
      ns.run("/advanced/cnct.js", 1, "CSEC");
      await ns.installBackdoor();
      await home(ns);
    }

    if (
      factions.includes("CyberSec") &&
      ns.getFactionRep("CyberSec") < 18.75e3 &&
      !ns.isBusy()
    ) {
      ns.workForFaction("CyberSec", "hacking");
    } else if (
      factions.includes("CyberSec") &&
      ns.getFactionRep("CyberSec") >= 18.75e3
    ) {
      // get augmentations here
      const augs = ns.getAugmentationsFromFaction("CyberSec");
      ns.tprint(augs);
    }

    for (const faction of ns.checkFactionInvitations()) {
      ns.joinFaction(faction);
    }

    await ns.sleep(1);
  }
}
