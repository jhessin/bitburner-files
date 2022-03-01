import { NS } from "Bitburner";

export async function main(ns: NS) {
  const target = ns.args[0].toString();

  while (true) {
    if (ns.hackAnalyzeChance(target) < 1) await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target))
      await ns.grow(target);
    else await ns.hack(target);
  }
}
