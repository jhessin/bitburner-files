import { NS } from "Bitburner";
import { getHackableServers } from "cnct";
import { kill } from "utils/scriptKilling";
import { ps } from "ps";
import { runSpawner, spawnerName } from "batching/runSpawner";

const bufferTime = 3000;
const growMultiplier = 4;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const target = getHackableServers(ns)[0].hostname;
  kill(
    ns,
    (ps) => ps.filename === "/phase1/monitor.js" && !ps.args.includes(target)
  );
  if (!ns.isRunning("/phase1/monitor.js", "home", target)) {
    ns.run("/phase1/monitor.js", 1, target);
    kill(ns, (ps) => ps.filename === "hack.js");
  }
  await prepBatch(ns, target);
}

async function prepBatch(ns: NS, target: string) {
  if (
    ps(ns).find(
      (proc) => proc.ps.filename === "hack.js" && proc.ps.args.includes(target)
    )
  ) {
    // already hacking
    ns.spawn("phase1/restart.js");
    return;
  }

  const fullGrowth = () =>
    ns.getServerMoneyAvailable(target) === ns.getServerMaxMoney(target);
  const minSecurity = () =>
    ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target);

  if (
    ps(ns).find(
      (proc) =>
        proc.ps.filename === spawnerName &&
        proc.ps.args.includes("grow") &&
        proc.ps.args.includes(target)
    )
  ) {
    // check for full growth and min security and if good stop all spawners and
    if (fullGrowth() && minSecurity()) {
      kill(ns, (ps) => ps.filename.startsWith("/batching"));
      ns.spawn("phase1/cheapHack.js", 1, target);
    } else ns.spawn("phase1/restart.js");
    return;
  }

  // now find the required number of threads for each action.
  const growThreads = Math.ceil(ns.growthAnalyze(target, growMultiplier));

  const growSecurityDelta = ns.growthAnalyzeSecurity(growThreads);

  let weakenThreads = 0;
  let targetDelta = growSecurityDelta;
  // pin targetDelta to 100 to prevent infinity
  if (targetDelta > 100) targetDelta = 100;

  while (ns.weakenAnalyze(weakenThreads) < targetDelta) {
    weakenThreads += 1;
    ns.toast(`Calculating Weaken Threads: ${weakenThreads}`);
    ns.toast(
      `${weakenThreads} threads will cut security by ${ns.weakenAnalyze(
        weakenThreads
      )}`
    );
    ns.toast(`Target security is ${targetDelta}`);
    await ns.sleep(1);
  }

  // calculate timing
  const { hackTime, growTime, weakenTime } = getTiming(ns, target);

  // sanity check
  if (hackTime > growTime || hackTime > weakenTime || growTime > weakenTime) {
    ns.tprint(`Something screwy going on with ${target} timing`);
    return;
  }

  if (
    ps(ns).find(
      (proc) =>
        proc.ps.filename === spawnerName &&
        proc.ps.args.includes("weaken") &&
        proc.ps.args.includes(target)
    )
  ) {
    // check for min security and if good start growing
    if (minSecurity()) {
      await runSpawner(ns, "grow", target, growThreads, bufferTime);
    }
    ns.spawn("phase1/restart.js");
    return;
  } else {
    await runSpawner(ns, "weaken", target, weakenThreads, bufferTime);
    ns.spawn("phase1/restart.js");
  }
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
