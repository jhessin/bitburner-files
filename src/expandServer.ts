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
    if (!ns.isBusy()) {
      work(ns);
    }

    expandServer(ns);
    await ns.sleep(1);
  }
}

export function expandServer(ns: NS) {
  const ramUpgradeCost = ns.getUpgradeHomeRamCost();
  const coreUpgradeCost = ns.getUpgradeHomeCoresCost();

  ns.print(`Ram Cost      : ${ns.nFormat(ramUpgradeCost, "$0.0a")}`);
  ns.print(`Core Cost     : ${ns.nFormat(coreUpgradeCost, "$0.0a")}`);

  if (ns.getServerMoneyAvailable("home") >= ramUpgradeCost) {
    ns.upgradeHomeRam();
  }

  if (ns.getServerMoneyAvailable("home") >= coreUpgradeCost) {
    ns.upgradeHomeCores();
  }
}

function work(ns: NS) {
  ns.applyToCompany(`Joe's Guns`, "part-time employee");
  ns.workForCompany(`Joe's Guns`);
}
