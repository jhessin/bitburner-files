import { NS } from "Bitburner";
import { getHackableServers } from "cnct";
import { weakenAll } from "weakenAll";
import { growAll } from "growAll";
import { hackAll } from "hackAll";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  ns.tail();

  while (true) {
    ns.tail();
    monitor(ns);
    const { hostname } = getTarget(ns);
    if (
      ns.getServerSecurityLevel(hostname) >
      ns.getServerMinSecurityLevel(hostname)
    ) {
      ns.print("Weakening");
      await weakenAll(ns);
    } else if (
      ns.getServerMoneyAvailable(hostname) < ns.getServerMaxMoney(hostname)
    ) {
      ns.print("Growing");
      await growAll(ns);
    } else {
      ns.print("Hacking");
      await hackAll(ns);
    }
    await ns.sleep(100000);
  }
}

function getTarget(ns: NS) {
  return getHackableServers(ns)[0];
}

export function monitor(ns: NS) {
  ns.clearLog();
  ns.disableLog("ALL");
  const { hostname } = getHackableServers(ns)[0];
  ns.print(`
  TARGET : ${hostname}
    `);
  const moneyAvailable = ns.getServerMoneyAvailable(hostname);
  const maxMoney = ns.getServerMaxMoney(hostname);
  const security = ns.getServerSecurityLevel(hostname);
  const minSecurity = ns.getServerMinSecurityLevel(hostname);
  const hackChance = ns.hackAnalyzeChance(hostname);

  ns.print(`${hostname}:
    Security      : ${security} / ${minSecurity}
    Money         : ${ns.nFormat(moneyAvailable, "$0.0a")} / ${ns.nFormat(
    maxMoney,
    "$0.0a"
  )}
    Hack Chance   : ${ns.nFormat(hackChance, "0.0%")}`);
}
