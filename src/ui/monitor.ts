import { AutocompleteData, NS, Server } from "Bitburner";
import { getHackableServers } from "cnct";
import { kill } from "utils/scriptKilling";

export async function main(ns: NS) {
  ns.disableLog("ALL");

  ns.tail();

  while (true) {
    ns.tail();
    ns.clearLog();
    let host = ns.args[0] as string;
    if (host && ns.serverExists(host)) monitor(ns, ns.getServer(host));
    else monitor(ns);
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
  const server = target || getTarget(ns);
  // always show the smallest time.
  server.hackDifficulty = server.minDifficulty;
  const player = ns.getPlayer();

  ns.print(`${hostname}:
    Security      : (${ns.nFormat(
      minSecurity / security,
      "000.00%"
    )}) +${ns.nFormat(security - minSecurity, "0.00a")}
    Money         : (${ns.nFormat(
      moneyAvailable / maxMoney,
      "000.00%"
    )}) ${ns.nFormat(moneyAvailable, "$0.0a")} / ${ns.nFormat(
    maxMoney,
    "$0.0a"
  )}
    Hack Chance   : ${ns.nFormat(hackChance, "0.0%")}
    Hack Time     : ${ns.tFormat(ns.formulas.hacking.hackTime(server, player))}
    Grow Time     : ${ns.tFormat(ns.formulas.hacking.growTime(server, player))}
    Waken Time    : ${ns.tFormat(
      ns.formulas.hacking.weakenTime(server, player)
    )}
    `);
}

export function autocomplete(data: AutocompleteData) {
  return data.servers;
}
