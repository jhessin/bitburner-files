import { NS } from "Bitburner";

// interface iGoal {
//   faction: string;
//   rep: number;
// }

// const factions: iGoal[] = [
//   {
//     faction: "Daedalus",
//     rep: 2310000,
//   },
//   {
//     faction: "ECorp",
//     rep: 1500000,
//   },
//   {
//     faction: "Speakers for the Dead",
//     rep: 362500,
//   },
//   {
//     faction: "The Covenant",
//     rep: 1250000,
//   },
//   {
//     faction: "Blade Industries",
//     rep: 562500,
//   },
//   {
//     faction: "The Syndicate",
//     rep: 875000,
//   },
//   {
//     faction: "KuaiGong International",
//     rep: 562500,
//   },
//   {
//     faction: "Bachman & Associates",
//     rep: 375000,
//   },
//   {
//     faction: "Clarke Incorporated",
//     rep: 437500,
//   },
//   {
//     faction: "Slum Snakes",
//     rep: 22500,
//   },
//   {
//     faction: "Silhouette",
//     rep: 62500,
//   },
// ];

const restrictedFactions = [
  "Sector-12",
  "Chongqing",
  "New Tokyo",
  "Ishima",
  "Aevum",
  "Volhaven",
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  while (true) {
    await ns.sleep(1);
    ns.clearLog();
    // ns.tail();
    factionWatch(ns);
  }
}

export function factionWatch(ns: NS) {
  const ownedAugs = ns.singularity.getOwnedAugmentations(true);
  for (const invitation of ns.singularity.checkFactionInvitations()) {
    // check if I need any of this factions augmentations.
    for (const aug of ns.singularity.getAugmentationsFromFaction(invitation)) {
      if (!ownedAugs.includes(aug)) {
        ns.singularity.joinFaction(invitation);
        break;
      }
    }
  }

  travel(ns);
}

export function travel(ns: NS) {
  // travel if necessary
  function findTargetCity() {
    for (const city of restrictedFactions) {
      if (
        !factionIsCleared(ns, city) &&
        !ns.getPlayer().factions.includes(city)
      ) {
        return city;
      }
    }
  }

  switch (ns.getPlayer().city) {
    case "Sector-12":
      if (
        (ns.getPlayer().factions.includes("Sector-12") ||
          factionIsCleared(ns, "Sector-12")) &&
        !ns.getPlayer().factions.includes("Aevum") &&
        !factionIsCleared(ns, "Aevum")
      )
        ns.singularity.travelToCity("Aevum");
      if (factionIsCleared(ns, "Sector-12") && factionIsCleared(ns, "Aevum")) {
        // check other cities
        const city = findTargetCity();
        if (city) ns.singularity.travelToCity(city);
      }
      break;
    case "Aevum":
      if (
        (ns.getPlayer().factions.includes("Aevum") ||
          factionIsCleared(ns, "Aevum")) &&
        !ns.getPlayer().factions.includes("Sector-12") &&
        !factionIsCleared(ns, "Sector-12")
      )
        ns.singularity.travelToCity("Sector-12");
      if (factionIsCleared(ns, "Sector-12") && factionIsCleared(ns, "Aevum")) {
        // check other cities
        const city = findTargetCity();
        if (city) ns.singularity.travelToCity(city);
      }
      break;
    case "Chongqing":
      if (
        ns.getPlayer().factions.includes("Chongqing") ||
        factionIsCleared(ns, "Chongqing")
      ) {
        if (
          !ns.getPlayer().factions.includes("New Tokyo") &&
          !factionIsCleared(ns, "New Tokyo")
        ) {
          ns.singularity.travelToCity("New Tokyo");
          break;
        }
        if (
          !ns.getPlayer().factions.includes("Ishima") &&
          !factionIsCleared(ns, "Ishima")
        ) {
          ns.singularity.travelToCity("Ishima");
          break;
        }
      }

      if (
        factionIsCleared(ns, "Chongqing") &&
        factionIsCleared(ns, "New Tokyo") &&
        factionIsCleared(ns, "Ishima")
      ) {
        // check other cities
        const city = findTargetCity();
        if (city) {
          ns.singularity.travelToCity(city);
          break;
        }
      }
    case "New Tokyo":
      if (
        ns.getPlayer().factions.includes("New Tokyo") ||
        factionIsCleared(ns, "New Tokyo")
      ) {
        if (
          !ns.getPlayer().factions.includes("Chongqing") &&
          !factionIsCleared(ns, "Chongqing")
        ) {
          ns.singularity.travelToCity("Chongqing");
          break;
        }
        if (
          !ns.getPlayer().factions.includes("Ishima") &&
          !factionIsCleared(ns, "Ishima")
        ) {
          ns.singularity.travelToCity("Ishima");
          break;
        }
      }

      if (
        factionIsCleared(ns, "Chongqing") &&
        factionIsCleared(ns, "New Tokyo") &&
        factionIsCleared(ns, "Ishima")
      ) {
        // check other cities
        const city = findTargetCity();
        if (city) {
          ns.singularity.travelToCity(city);
          break;
        }
      }
    case "Ishima":
      if (
        ns.getPlayer().factions.includes("Ishima") ||
        factionIsCleared(ns, "Ishima")
      ) {
        if (
          !ns.getPlayer().factions.includes("New Tokyo") &&
          !factionIsCleared(ns, "New Tokyo")
        ) {
          ns.singularity.travelToCity("New Tokyo");
          break;
        }
        if (
          !ns.getPlayer().factions.includes("Chongqing") &&
          !factionIsCleared(ns, "Chongqing")
        ) {
          ns.singularity.travelToCity("Chongqing");
          break;
        }
      }

      if (
        factionIsCleared(ns, "Chongqing") &&
        factionIsCleared(ns, "New Tokyo") &&
        factionIsCleared(ns, "Ishima")
      ) {
        // check other cities
        const city = findTargetCity();
        if (city) {
          ns.singularity.travelToCity(city);
          break;
        }
      }
    case "Volhaven":
      if (factionIsCleared(ns, "Volhaven")) {
        // check other cities
        const city = findTargetCity();
        if (city) {
          ns.singularity.travelToCity(city);
          break;
        }
      }
  }
}

export function factionIsCleared(ns: NS, faction: string) {
  const owned = ns.singularity.getOwnedAugmentations(true);
  if (
    ns.singularity
      .getAugmentationsFromFaction(faction)
      .filter((aug) => !owned.includes(aug)).length === 0
  )
    return true;
  return false;
}
