import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will run continuously and expand your server for you. It will
      only work with Source File 4.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  while (true) {
    if (!ns.singularity.isBusy()) {
      work(ns);
    }

    expandServer(ns);
    await ns.sleep(1);
  }
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

function work(ns: NS) {
  ns.singularity.applyToCompany(`Joe's Guns`, "part-time employee");
  ns.singularity.workForCompany(`Joe's Guns`);
}
