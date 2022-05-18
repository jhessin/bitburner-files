import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  expandServer(ns);

  ns.spawn("/phase1/actions/program.js");
}

export function expandServer(ns: NS) {
  const ramUpgradeCost = ns.singularity.getUpgradeHomeRamCost();
  const coreUpgradeCost = ns.singularity.getUpgradeHomeCoresCost();

  if (ns.getServerMoneyAvailable("home") >= ramUpgradeCost) {
    ns.singularity.upgradeHomeRam();
  }

  if (ns.getServerMoneyAvailable("home") >= coreUpgradeCost) {
    ns.singularity.upgradeHomeCores();
  }
}
