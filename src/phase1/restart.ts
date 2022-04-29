import { NS } from "Bitburner";
// import { getNeededFactions } from "actions/factionHunt";
// import { purchasePricey } from "actions/augmentations";

const phase2RAM = 500;

export async function main(ns: NS) {
  ns.disableLog("ALL");

  if (ns.getServerMaxRam("home") > phase2RAM) ns.spawn("phase2/restart.js");

  // TODO: factionHunt Here //
  // await purchasePricey(ns);
  // if (!(await purchasePricey(ns))) getNeededFactions(ns)[0].workToJoin();

  ns.spawn("/phase1/nuke.js");
}
