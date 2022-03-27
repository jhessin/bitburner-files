import { AutocompleteData, NS } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint("This script analyzes hackable server wealth/health.");
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }
  await ns.sleep(1000);
  ns.clearLog();
  ns.tail();

  const tree = new ServerTree(ns);

  for (const server of tree.home
    .filter(
      (s) =>
        s.hasAdminRights &&
        s.requiredHackingSkill <= ns.getHackingLevel() &&
        s.hostname !== "home" &&
        !ns.getPurchasedServers().includes(s.hostname) &&
        s.moneyMax > 0
    )
    .sort((a, b) => {
      const maxMoneyA = ns.getServerMaxMoney(a.hostname);
      const maxMoneyB = ns.getServerMaxMoney(b.hostname);
      // const availableRam =
      //   (ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) * 1e9;
      let hackChanceA = 0;
      let hackChanceB = 0;
      let hackTimeA = 1;
      let hackTimeB = 1;
      if (ns.fileExists("Formulas.exe")) {
        a.hackDifficulty = a.minDifficulty;
        b.hackDifficulty = b.minDifficulty;
        hackChanceA = ns.formulas.hacking.hackChance(a, ns.getPlayer());
        hackChanceB = ns.formulas.hacking.hackChance(b, ns.getPlayer());
        hackTimeA = ns.formulas.hacking.hackTime(a, ns.getPlayer());
        hackTimeB = ns.formulas.hacking.hackTime(b, ns.getPlayer());
      } else {
        hackChanceA = ns.hackAnalyzeChance(a.hostname);
        hackChanceB = ns.hackAnalyzeChance(b.hostname);
      }
      const valueA = (maxMoneyA * hackChanceA) / hackTimeA;
      const valueB = (maxMoneyB * hackChanceB) / hackTimeB;
      return valueB - valueA;
    })) {
    analyzeServer(ns, server.hostname);
  }
}

function analyzeServer(ns: NS, server: string, msg: string = "") {
  const maxMoney = ns.getServerMaxMoney(server);
  // const availableRam =
  //   (ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) * 1e9;
  let hackChance = 0;
  if (ns.fileExists("Formulas.exe")) {
    const testServer = ns.getServer(server);
    testServer.hackDifficulty = testServer.minDifficulty;
    hackChance = ns.formulas.hacking.hackChance(testServer, ns.getPlayer());
  } else {
    hackChance = ns.hackAnalyzeChance(server);
  }
  if (msg) ns.print(msg);
  const value = maxMoney * hackChance;
  ns.print(
    `${server}:
      ${ns.nFormat(value, "$0.000a")}`
  );
}

export function autocomplete(data: AutocompleteData) {
  return data.servers;
}
