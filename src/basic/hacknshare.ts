import { NS } from "Bitburner";

const targetChance = 60;
const targetMoney = 0.75;

export async function main(ns: NS) {
  const target = ns.args[0].toString();

  while (true) {
    await ns.share();
    if (ns.hackAnalyzeChance(target) * 100 < targetChance) {
      await ns.weaken(target);
    } else if (
      ns.getServerMoneyAvailable(target) <
      ns.getServerMaxMoney(target) * targetMoney
    ) {
      await ns.grow(target);
    } else {
      await ns.hack(target);
    }
  }
}
