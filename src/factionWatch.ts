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
  const ownedAugs = ns.getOwnedAugmentations(true);
  for (const invitation of ns.checkFactionInvitations()) {
    // check if I need any of this factions augmentations.
    for (const aug of ns.getAugmentationsFromFaction(invitation)) {
      if (!ownedAugs.includes(aug)) {
        ns.joinFaction(invitation);
        break;
      }
    }
  }

  const { factions } = ns.getPlayer();
  // now check for the first invitation;
  if (factions.length === 0) {
    for (const invitation of ns.checkFactionInvitations()) {
      // skip restricted factions here.
      if (restrictedFactions.includes(invitation)) continue;
      ns.joinFaction(invitation);
      break;
    }
  }
}
