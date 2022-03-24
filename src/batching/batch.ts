import { NS } from "Bitburner";

const hackScript = "/batching/hack.js";
const growScript = "/batching/grow.js";
const weakenScript = "/batching/weaken.js";

const files = [hackScript, growScript, weakenScript];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const host = args._[0];
  const target = args._[1];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !host || !target) {
    ns.tprint(`
      This will continuously batch hack a target from a host.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} HOST TARGET
      `);
    return;
  }
  const hostServer = ns.getServer(host);

  // first copy files.
  await ns.scp(files, host);

  // now find the required number of threads for each action.
  const growThreads = Math.ceil(
    ns.growthAnalyze(target, 2, hostServer.cpuCores)
  );
  const hackThreads = Math.ceil(0.5 / ns.hackAnalyze(target));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);
  const hackSecurityDelta = ns.hackAnalyzeSecurity(hackThreads);

  let weakenThreads = 0;
  while (
    ns.weakenAnalyze(weakenThreads, hostServer.cpuCores) <
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

  // Calculate the amount of memory required
  const ramRequired =
    hackThreads * ns.getScriptRam(hackScript) +
    growThreads * ns.getScriptRam(growScript) +
    weakenThreads * ns.getScriptRam(weakenScript);

  if (hostServer.maxRam - hostServer.ramUsed < ramRequired) {
    ns.tprint(`${host} doesn't have enough memory to batch attack ${target}`);
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
  const batchTime = weakenTime + bufferTime;

  while (true) {
    ns.exec(weakenScript, host, weakenThreads, target);
    await ns.sleep(batchTime - growTime - bufferTime * 2);
    ns.exec(growScript, host, growThreads, target);
    await ns.sleep(growTime - hackTime - bufferTime * 2);
    ns.exec(hackScript, host, hackThreads, target);
    await ns.sleep(bufferTime * 4);
  }
}
