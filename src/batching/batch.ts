import { NS } from "Bitburner";

const scriptName = "/batching/spawner.js";
const growScript = "/batching/grow.js";
const weakenScript = "/batching/weaken.js";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.enableLog("exec");
  ns.enableLog("run");
  const args = ns.flags([["help", false]]);
  const target = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !target) {
    ns.tprint(`
      This will continuously batch hack a target from a host.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} TARGET
      `);
    return;
  }

  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, 2));
  const hackThreads = Math.ceil(0.5 / ns.hackAnalyze(target));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);
  const hackSecurityDelta = ns.hackAnalyzeSecurity(hackThreads);

  let weakenThreads = 0;
  while (
    ns.weakenAnalyze(weakenThreads) <
    growSecurityDelta + hackSecurityDelta
  ) {
    await ns.sleep(1);
    weakenThreads += 1;
    ns.clearLog();
    ns.print(`Calculating Weaken Threads: ${weakenThreads}`);
    ns.print(
      `${weakenThreads} threads will cut security by ${ns.weakenAnalyze(
        weakenThreads
      )}`
    );
    ns.print(`Target security is ${growSecurityDelta + hackSecurityDelta}`);
  }

  // calculate timing
  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  // sanity check
  if (hackTime > growTime || hackTime > weakenTime || growTime > weakenTime) {
    ns.tprint(`Something screwing going on with ${target} timing`);
    return;
  }

  const bufferTime = 300;

  // Prepare the server
  ns.clearLog();
  ns.print(`Preparing ${target} for hacking...`);
  ns.print("Growing...");
  while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
    ns.run(growScript, 1, target, Date.now());
    await ns.sleep(100);
  }
  ns.scriptKill(growScript, ns.getHostname());
  ns.print("Weakening...");
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  ) {
    ns.run(weakenScript, 1, target, Date.now());
    await ns.sleep(100);
  }
  ns.scriptKill(weakenScript, ns.getHostname());

  ns.print("Hacking...");
  ns.run(scriptName, 1, "weaken", target, weakenThreads, bufferTime);
  await ns.sleep(bufferTime * 3);
  ns.run(scriptName, 1, "grow", target, growThreads, bufferTime);
  await ns.sleep(bufferTime * 3);
  ns.run(scriptName, 1, "hack", target, hackThreads, bufferTime);
}
