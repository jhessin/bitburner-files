import { NS } from "Bitburner";
import { getPlayerDetails } from "lib/getDetails";
import { home } from "advanced/cnct.js";

const storyFactions: {
  name: string;
  ports: number;
  hackingLevel: number;
  minCash: number;
  completed: boolean;
  server?: string;
}[] = [
  {
    name: "CyberSec",
    server: "CSEC",
    hackingLevel: 56,
    ports: 1,
    completed: false,
    minCash: 0,
  },
  {
    name: "NiteSec",
    server: "avmnite-02h",
    hackingLevel: 214,
    ports: 2,
    minCash: 0,
    completed: false,
  },
  {
    name: "The Black Hand",
    server: "I.I.I.I",
    hackingLevel: 362,
    ports: 3,
    minCash: 0,
    completed: false,
  },
  {
    name: "BitRunners",
    server: "run4theh111z",
    hackingLevel: 538,
    ports: 4,
    minCash: 0,
    completed: false,
  },
  {
    name: "Daedalus",
    hackingLevel: 2500,
    minCash: 100e9,
    ports: 0,
    completed: false,
  },
];

export async function main(ns: NS) {
  // start initial scripts here.
  ns.run("/basic/cpall.js");
  if (ns.getServerMaxRam("home") > 500) {
    ns.run("/advanced/daemon.js");
  } else {
    ns.run("/advanced/starterCrime.js");
  }
  const ownedAugs = ns.getOwnedAugmentations();
  function filterAugs(augs: string[]) {
    return augs.filter(
      (a) => !ownedAugs.includes(a) && !a.startsWith("NeuroFlux")
    );
  }

  function getMostExpensiveAug(faction: string) {
    const augs = filterAugs(ns.getAugmentationsFromFaction(faction));
    if (augs.length === 0) return undefined;
    let best: [string, number] = ["", 0];
    for (const aug of augs) {
      const price = ns.getAugmentationPrice(aug);
      if (price > best[1]) best = [aug, price];
    }
    return best[0];
  }

  while (true) {
    const { hackingLevel, portHacks } = getPlayerDetails(ns);
    const { factions } = ns.getPlayer();

    for (const fd of storyFactions) {
      const faction = fd.name;
      if (
        !factions.includes(faction) &&
        hackingLevel >= fd.hackingLevel &&
        portHacks >= fd.ports
      ) {
        ns.run("/basic/nuke.js", 1, "CSEC");
        ns.run("/advanced/cnct.js", 1, "CSEC");
        await ns.installBackdoor();
        await home(ns);
      }

      if (
        factions.includes(faction) &&
        ns.getFactionRep(faction) < 18.75e3 &&
        !ns.isBusy()
      ) {
        ns.workForFaction(faction, "hacking");
      } else if (
        factions.includes(faction) &&
        ns.getFactionRep(faction) >= 18.75e3
      ) {
        // get augmentations here
        const augs = filterAugs(ns.getAugmentationsFromFaction(faction));
        if (augs.length === 1 && ns.purchaseAugmentation(faction, augs[0])) {
          ns.installAugmentations("/advanced/story.js");
        } else {
          // const aug = getMostExpensiveAug(faction);
          // TODO - get aug requirements.
          // fulfil the requirements.
          // install the aug
        }
      }
    }

    for (const faction of ns.checkFactionInvitations()) {
      ns.joinFaction(faction);
    }

    await ns.sleep(1);
  }
}
