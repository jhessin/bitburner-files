import { NS } from "Bitburner";
import { getNeededFactions } from "actions/factionHunt";

export async function main(ns: NS) {
  const neededFactions = getNeededFactions(ns);
  ns.disableLog("ALL");
  ns.tail();
  ns.print(`Needed Factions`);
  ns.print(`===============`);
  for (const faction of neededFactions) {
    ns.print(faction.name);
  }
  if (neededFactions.length === 0) ns.print("NONE");
}
