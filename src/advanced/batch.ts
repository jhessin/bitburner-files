import { NS } from "Bitburner";
import { getRunnableServers } from "lib/getall";
import { killAll } from "advanced/killall";
import {
  analyzeServer,
  getMemForHack,
  getMemForGrow,
  getMemForWeaken,
  getServerFreeRam,
  growThreads,
  hackThreads,
  weakenThreads,
  hackTime,
  growTime,
  weakenTime,
} from "lib/analyze_server";

export async function main(ns: NS) {
  await batch(ns, ns.args[0].toString());
}

async function batch(ns: NS, target: string) {
  let weakenThreads = 1;
  // Growth Phase
  ns.print("Begining growth phase.");
  await killAll(ns);
  ns.scriptKill("/basic/weaken.js", "home");
  ns.scriptKill("/basic/hack.js", "home");
  analyzeServer(ns, target, false);
  weakenThreads = await deployGrow(ns, target);

  // Weaken Phase
  ns.print("Beginning Weaken Phase");
  await killAll(ns);
  ns.scriptKill("/basic/grow.js", "home");
  ns.scriptKill("/basic/hack.js", "home");
  analyzeServer(ns, target, false);
  while (ns.hackAnalyzeChance(target) < 1) {
    await deployWeaken(ns, target);
  }

  // Hack Phase
  ns.print("Benninging Hack Phase");
  analyzeServer(ns, target, false);
  await killAll(ns);
  ns.scriptKill("/basic/weaken.js", "home");
  ns.scriptKill("/basic/grow.js", "home");
  while (true) {
    await deployHack(ns, target, weakenThreads);
  }
}

async function deployHack(ns: NS, target: string, threadsToWeaken: number) {
  // get hackTime and threads
  const timeToHack = hackTime(ns, target);
  const timeToGrow = growTime(ns, target);
  const timeToWeaken = weakenTime(ns, target);
  const threadsToHack = hackThreads(ns, target);
  const threadsToGrow = growThreads(ns, target);

  let weakening = false;
  let growing = false;
  let hacking = false;
  for (const host of await getRunnableServers(ns)) {
    // first check if the server can successfully hack the target.
    if (
      !weakening &&
      getServerFreeRam(ns, host) >= getMemForWeaken(ns, target)
    ) {
      // Start with a weaken
      if (ns.exec("/basic/weaken.js", host, threadsToWeaken, target)) {
        weakening = true;
        await ns.sleep(timeToWeaken - timeToGrow - 2);
      }
    } else if (
      !growing &&
      getServerFreeRam(ns, host) >= getMemForGrow(ns, target)
    ) {
      if (ns.exec("/basic/grow.js", host, threadsToGrow, target)) {
        growing = true;
        await ns.sleep(timeToGrow - timeToHack - 1);
      }
    } else if (
      !hacking &&
      getServerFreeRam(ns, host) >= getMemForHack(ns, target)
    ) {
      if (ns.exec("/basic/hack.js", host, threadsToHack, target)) {
        hacking = true;
        await ns.sleep(timeToHack + 4);
        break;
      }
    }
  }
}

async function deployGrow(ns: NS, target: string): Promise<number> {
  for (const host of await getRunnableServers(ns)) {
    if (getServerFreeRam(ns, host) < getMemForGrow(ns, target)) continue;
    if (!ns.exec("/basic/grow.js", host, growThreads(ns, target), target))
      continue;
    await ns.sleep(growTime(ns, target));
    break;
  }
  return weakenThreads(ns, target);
}

async function deployWeaken(ns: NS, target: string) {
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  ) {
    for (const host of await getRunnableServers(ns)) {
      if (!ns.exec("/basic/weaken.js", host, weakenThreads(ns, target), target))
        continue;
      await ns.sleep(weakenTime(ns, target));
      break;
    }
  }
}

}
