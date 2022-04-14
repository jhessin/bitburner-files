import { AutocompleteData, NS } from "Bitburner";
import { kill } from "utils/scriptKilling";
import { runSpawner, spawnerName } from "batching/runSpawner";

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
  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);

  let weakenThreads = 0;
  let targetDelta = growSecurityDelta;
  // pin targetDelta to 100 to prevent infinity
  if (targetDelta > 100) targetDelta = 100;

  while (ns.weakenAnalyze(weakenThreads) < targetDelta) {
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

  // calculate timing
  const { hackTime, growTime, weakenTime } = getTiming(ns, target);

  // sanity check
  if (hackTime > growTime || hackTime > weakenTime || growTime > weakenTime) {
    ns.tprint(`Something screwy going on with ${target} timing`);
    return;
  }

  ns.print("Preparing...");
  await runSpawner(ns, "weaken", target, weakenThreads, bufferTime);
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  )
    await ns.sleep(bufferTime);
  await runSpawner(ns, "grow", target, growThreads, bufferTime);
  while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target))
    await ns.sleep(bufferTime);
  kill(
    ns,
    (ps) =>
      (ps.filename === spawnerName && ps.args.includes(target)) ||
      (ps.filename.includes("grow") && ps.args.includes(target)) ||
      (ps.filename.includes("weaken") && ps.args.includes(target))
  );
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
