import { NS } from "Bitburner";
import { getRunnableServers } from "lib/getall";
import {
  analyzeServer,
  growThreads,
  hackThreads,
  weakenThreads,
  hackTime,
  growTime,
  weakenTime,
} from "lib/analyze_server";

const bufferTime = 300;
export async function main(ns: NS) {
  await batch(ns, ns.args[0].toString());
}

async function batch(ns: NS, target: string) {
  ns.disableLog("ALL");
  let weakenThreads = 1;
  // Growth Phase
  ns.print("Begining growth phase.");
  analyzeServer(ns, target, false);
  weakenThreads = await deployGrow(ns, target);

  // Weaken Phase
  ns.print("Beginning Weaken Phase");
  analyzeServer(ns, target, false);
  while (
    ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
  ) {
    await deployWeaken(ns, target);
  }

  // Hack Phase
  ns.print("Benninging Hack Phase");
  analyzeServer(ns, target, false);
  await deployHack(ns, target, weakenThreads);
}

async function deployHack(ns: NS, target: string, threadsToWeaken: number) {
  // get hackTime and threads
  const timeToHack = hackTime(ns, target);
  const timeToGrow = growTime(ns, target);
  const timeToWeaken = weakenTime(ns, target);
  let threadsToHack = hackThreads(ns, target);
  let threadsToGrow = growThreads(ns, target);

  let weakening = false;
  let growing = false;
  let hacking = false;
  let sleepTime = 1;
  let firstRun = true;
  while (true) {
    for (const host of await getRunnableServers(ns)) {
      if (!weakening) {
        // Start with a weaken
        if (ns.exec("/basic/weaken.js", host, threadsToWeaken, target)) {
          weakening = true;
          sleepTime = firstRun
            ? timeToWeaken
            : timeToWeaken - timeToGrow - bufferTime;
          ns.print(
            `${host} => ${target} weakening and sleeping for ${ns.tFormat(
              sleepTime
            )}`
          );
          await ns.sleep(Math.floor(sleepTime));
          ns.print("Woke up from my nap...");
        }
      }
      if (!growing) {
        if (ns.exec("/basic/grow.js", host, threadsToGrow, target)) {
          growing = true;
          sleepTime = firstRun
            ? timeToGrow
            : timeToGrow - timeToHack - bufferTime;
          ns.print(
            `${host} => ${target} growing and sleeping for ${sleepTime}`
          );
          await ns.sleep(sleepTime);
          if (firstRun) threadsToWeaken = weakenThreads(ns, target);
        }
      }
      if (!hacking) {
        if (ns.exec("/basic/hack.js", host, threadsToHack, target)) {
          hacking = true;
          sleepTime = firstRun ? timeToHack : timeToHack + bufferTime;
          ns.print(
            `${host} => ${target} hacking and sleeping for ${sleepTime}`
          );
          await ns.sleep(sleepTime);
          if (firstRun) threadsToGrow = growThreads(ns, target);
          firstRun = false;
          break;
        }
      }
    }
    await ns.sleep(sleepTime);
  }
}

async function deployGrow(ns: NS, target: string): Promise<number> {
  for (const host of await getRunnableServers(ns)) {
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
