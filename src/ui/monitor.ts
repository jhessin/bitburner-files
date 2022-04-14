import { NS, Server } from "Bitburner";
import { getHackableServers } from "cnct";
import { kill } from "utils/scriptKilling";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  ns.tail();

  let { hostname } = getTarget(ns);
  ns.run("batching/batch.js", 1, hostname);

  while (true) {
    ns.tail();
    ns.clearLog();
    monitor(ns);
    const newHost = getTarget(ns).hostname;
    if (newHost !== hostname) {
      kill(ns, (ps) => ps.args.includes(hostname));
      hostname = newHost;
      ns.run("batching/batchLite.js", 1, hostname);
    }
    await ns.sleep(1);
  }
}

function getTarget(ns: NS) {
  return getHackableServers(ns)[0];
}

export function monitor(ns: NS, target: Server | null = null) {
  ns.disableLog("ALL");
  const { hostname } = target || getTarget(ns);
  ns.print(`
  ScriptXP    : ${ns.nFormat(ns.getScriptExpGain(), "0.0a")} / sec.
  Cash/sec    : ${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")} / sec.
  Total Cash  : ${ns.nFormat(ns.getScriptIncome()[1], "$0.0a")}
  TARGET      : ${hostname}
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
