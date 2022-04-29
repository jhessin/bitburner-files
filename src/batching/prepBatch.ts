import { AutocompleteData, NS } from "Bitburner";
import { kill } from "utils/scriptKilling";
import { runSpawner, spawnerName } from "batching/runSpawner";
import { purchaseServers, upgradeServers } from "purchase";
import { ps } from "ps";

const bufferTime = 3000;
const growMultiplier = 4;

const analyzeScript = "/analyzeServer.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.enableLog("exec");
  ns.enableLog("run");
  const args = ns.flags([["help", false]]);
  const target = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !target) {
    ns.tprint(`
      This will continuously prepare a server untill it's money is at maximum and it's security is at minimum.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} TARGET
      `);
    return;
  }

  // analyze the server
  ns.run(analyzeScript, 1, target, `Batch attack!`);

  await prepBatch(ns, target);
}

export async function prepBatch(ns: NS, target: string) {
  if (
    ps(ns).find(
      (proc) =>
        proc.ps.filename === spawnerName &&
        proc.ps.args.includes("hack") &&
        proc.ps.args.includes(target)
    )
  )
    return;

  kill(ns, (proc) => proc.filename === spawnerName);
  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);

  let weakenThreads = 0;
  let targetDelta = growSecurityDelta;
  // pin targetDelta to 100 to prevent infinity
  if (targetDelta > 100) targetDelta = 100;

  while (ns.weakenAnalyze(weakenThreads) < targetDelta) {
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    await ns.sleep(1);
    weakenThreads += 1;
    ns.clearLog();
    ns.print(`Calculating Weaken Threads: ${weakenThreads}`);
    ns.print(
      `${weakenThreads} threads will cut security by ${ns.weakenAnalyze(
        weakenThreads
      )}`
    );
    ns.print(`Target security is ${targetDelta}`);
  }
  ns.clearLog();

  // calculate timing
  const { hackTime, growTime, weakenTime } = getTiming(ns, target);

  // sanity check
  if (hackTime > growTime || hackTime > weakenTime || growTime > weakenTime) {
    ns.tprint(`Something screwy going on with ${target} timing`);
    return;
  }

  ns.toast(`Preparing ${target}`);
  await runSpawner(ns, "weaken", target, weakenThreads, bufferTime);
  ns.clearLog();
  ns.toast(`Weakening ${target}`);
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  ) {
    ns.clearLog();
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    await ns.sleep(1);
  }
  ns.clearLog();
  await runSpawner(ns, "grow", target, growThreads, bufferTime);
  ns.clearLog();
  ns.toast(`Growing ${target}`);
  while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
    ns.clearLog();
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    await ns.sleep(1);
  }
  ns.clearLog();
  kill(ns, (ps) => ps.filename === spawnerName);
}

function getTiming(ns: NS, target: any) {
  let hackTime = 1;
  let growTime = 1;
  let weakenTime = 1;
  if (ns.fileExists("Formulas.exe")) {
    const server = ns.getServer(target);
    server.hackDifficulty = server.minDifficulty;
    const player = ns.getPlayer();

    hackTime = ns.formulas.hacking.hackTime(server, player);
    growTime = ns.formulas.hacking.growTime(server, player);
    weakenTime = ns.formulas.hacking.weakenTime(server, player);
  } else {
    hackTime = ns.getHackTime(target);
    growTime = ns.getGrowTime(target);
    weakenTime = ns.getWeakenTime(target);
  }
  return { hackTime, growTime, weakenTime };
}

export function autocomplete(data: AutocompleteData) {
  return data.servers;
}
