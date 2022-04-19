import { AutocompleteData, NS } from "Bitburner";
import { getRunnableServers } from "cnct";
import { kill } from "utils/scriptKilling";
import { prepBatch } from "batching/prepBatch";
import { runSpawner, spawnerName } from "batching/runSpawner";
import { ps } from "ps";
import { expandServer } from "expandServer";
import { commitCrime } from "actions/crime";
import { purchaseServers, upgradeServers } from "purchase";

const minBufferTime = 60;
let bufferTime = minBufferTime;
const growMultiplier = 4;
const hackPercent = 0.5;

const analyzeScript = "ui/monitor.js";

const runningScripts = [
  "/batching/hack.js",
  "/batching/grow.js",
  "/batching/weaken.js",
  spawnerName,
];

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

  // analyze the server
  ns.run(analyzeScript, 1, target, `Batch attack!`);

  await prepBatch(ns, target);

  await batch(ns, target);
}

export async function batch(ns: NS, target: string) {
  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));
  const hackThreads = Math.ceil(hackPercent / ns.hackAnalyze(target));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);
  const hackSecurityDelta = ns.hackAnalyzeSecurity(hackThreads);

  let weakenThreads = 0;
  let targetDelta = Math.max(growSecurityDelta, hackSecurityDelta);
  // pin targetDelta to 100 to prevent infinity
  if (targetDelta > 100) targetDelta = 100;

  const maxThreads = Math.max(hackThreads, weakenThreads, growThreads);
  const reserveRam = Math.max(
    ...runningScripts.map((script) => ns.getScriptRam(script) * maxThreads)
  );

  const scriptCount = Math.floor(totalRAM(ns) / reserveRam);

  // calculate timing
  const { hackTime, growTime, weakenTime } = getTiming(ns, target);

  const maxTime = Math.max(hackTime, growTime, weakenTime);

  bufferTime = maxTime / scriptCount;
  if (bufferTime < minBufferTime) bufferTime = minBufferTime;

  // check if this server is already being batched.
  if (
    ps(ns).find(
      (ps) =>
        ps.ps.args.includes(target) &&
        ps.ps.filename === spawnerName &&
        ps.ps.args.includes("hack") &&
        ps.ps.args.includes(bufferTime.toString())
    )
  )
    // already hacking
    return;

  // otherwise kill any batching that is going on.
  kill(ns, (ps) => ps.filename === spawnerName);

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

  // sanity check
  if (hackTime > growTime || hackTime > weakenTime || growTime > weakenTime) {
    ns.tprint(`Something screwy going on with ${target} timing`);
    return;
  }

  ns.print("Hacking...");
  await runSpawner(ns, "weaken", target, weakenThreads, bufferTime, 1);
  await ns.sleep(weakenTime - (bufferTime * 2) / 3);
  await runSpawner(ns, "weaken", target, weakenThreads, bufferTime, 2);
  await ns.sleep(weakenTime - growTime - bufferTime / 3);
  await runSpawner(ns, "grow", target, growThreads, bufferTime);
  await ns.sleep(growTime - hackTime - (bufferTime * 2) / 3);
  await runSpawner(ns, "hack", target, hackThreads, bufferTime);
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

export async function prepareServer(ns: NS, target: any) {
  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));
  const hackThreads = Math.ceil(hackPercent / ns.hackAnalyze(target));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);
  const hackSecurityDelta = ns.hackAnalyzeSecurity(hackThreads);

  let weakenThreads = 0;
  let targetDelta = Math.max(growSecurityDelta, hackSecurityDelta);
  // pin targetDelta to 100 to prevent infinity
  if (targetDelta > 100) targetDelta = 100;

  while (ns.weakenAnalyze(weakenThreads) < targetDelta) {
    await ns.sleep(1);
    weakenThreads += 1;
    // ns.clearLog();
    // ns.print(`Calculating Weaken Threads: ${weakenThreads}`);
    // ns.print(
    //   `${weakenThreads} threads will cut security by ${ns.weakenAnalyze(
    //     weakenThreads
    //   )}`
    // );
    // ns.print(`Target security is ${targetDelta}`);
  }

  // ns.print(`Preparing ${target} for hacking...`);
  // ns.print("Growing...");
  await killMsg(ns, "hack", target);
  ns.run(spawnerName, 1, "grow", target, growThreads, bufferTime);
  ns.run(spawnerName, 1, "weaken", target, weakenThreads, bufferTime);
  while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
    expandServer(ns);
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    await commitCrime(ns);
  }
  // ns.kill(growPid);
  await killMsg(ns, "grow", target);
  // ns.print("Weakening...");
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  ) {
    expandServer(ns);
    if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit())
      await purchaseServers(ns);
    else await upgradeServers(ns);
    await commitCrime(ns);
  }
  // ns.kill(weakenPid);
  await killMsg(ns, "weaken", target);
}

async function killMsg(ns: NS, cmd: string, target: any) {
  kill(ns, (ps) => {
    if (
      ps.filename === spawnerName &&
      ps.args.includes(cmd) &&
      ps.args.includes(target)
    )
      return true;
    if (ps.filename.includes(cmd) && ps.args.includes(target)) return true;
    return false;
  });
}

export function autocomplete(data: AutocompleteData) {
  return data.servers;
}

function totalRAM(ns: NS) {
  let total = 0;
  for (const { hostname } of getRunnableServers(ns)) {
    const host = hostname;
    total += ns.getServerMaxRam(host);
  }
  return total - ns.getServerUsedRam("home");
}
