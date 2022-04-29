import { NS, AutocompleteData } from "Bitburner";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const target = ns.args[0] as string;
  while (true) {
    ns.clearLog();
    ns.tail();
    ns.print(`
  Home RAM        : ${ns.nFormat(ns.getServerMaxRam("home") * 1e9, "0b")}
  Upgrade Cost    : ${ns.nFormat(
    ns.singularity.getUpgradeHomeRamCost(),
    "$0.0a"
  )}
  Script Income   : ${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")}
  Target Server   : ${target}
  Server Security : +${
    ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)
  }
  Server Cash     : ${ns.nFormat(
    ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target),
    "0.0%"
  )}
      `);
    await ns.sleep(1);
  }
}

export function autocomplete(data: AutocompleteData) {
  return data.servers;
}
