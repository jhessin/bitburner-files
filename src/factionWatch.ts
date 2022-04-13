import { NS } from "Bitburner";

interface iGoal {
  faction: string;
  rep: number;
}

const factions: iGoal[] = [
  {
    faction: "Daedalus",
    rep: 2310000,
  },
  {
    faction: "ECorp",
    rep: 1500000,
  },
  {
    faction: "Speakers for the Dead",
    rep: 362500,
  },
  {
    faction: "The Covenant",
    rep: 1250000,
  },
  {
    faction: "Blade Industries",
    rep: 562500,
  },
  {
    faction: "The Syndicate",
    rep: 875000,
  },
  {
    faction: "KuaiGong International",
    rep: 562500,
  },
  {
    faction: "Bachman & Associates",
    rep: 375000,
  },
  {
    faction: "Clarke Incorporated",
    rep: 437500,
  },
  {
    faction: "Slum Snakes",
    rep: 22500,
  },
  {
    faction: "Silhouette",
    rep: 62500,
  },
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  while (true) {
    await ns.sleep(1);
    ns.clearLog();
    ns.tail();
    const filtered = factions.filter(
      (g) => ns.getFactionRep(g.faction) < g.rep
    );
    if (filtered.length === 0) return;
    for (const goal of filtered) {
      let current = ns.getFactionRep(goal.faction);
      let needed = goal.rep - current;
      ns.print(`
        ${goal.faction} needs ${ns.nFormat(needed, "0.0a")} rep
        `);
    }
  }
}
