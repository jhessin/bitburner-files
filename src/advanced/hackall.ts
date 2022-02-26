import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";
import { deployToAll } from "lib/deploy";
import { killAll } from "advanced/killall";

const bestServerCheckDuration =
  1000 * // = 1 second
  60 * // = 1 minute
  60 * // = 1 hour
  24; // = 1 day
const scriptUpdateDuration =
  1000 * // = 1 second
  60 * // = 1 minute
  30; // = 1/2 hour
const maxPhaseRuntime =
  1000 * // = 1 second
  60 * // = 1 minute
  60; // = 1 hour

export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  let [target, maxMoney] = ["", 0];
  // let scriptStartTime = Date.now();
  while (true) {
    const oldTarget = target;
    [target, maxMoney] = await getBestServer(ns);
    if (target === oldTarget) {
      await ns.sleep(bestServerCheckDuration);
      continue;
    }
    // Growth Phase
    let phaseStartTime = Date.now();
    while (ns.getServerMoneyAvailable(target) < maxMoney) {
      await deployToAll(ns, "/basic/grow.js", false, target);
      if (Date.now() - phaseStartTime > maxPhaseRuntime) break;
      await ns.sleep(scriptUpdateDuration);
    }

    // Weaken Phase
    await killAll(ns);
    phaseStartTime = Date.now();
    while (ns.hackAnalyzeChance(target) < 0.5) {
      await deployToAll(ns, "/basic/weaken.js", false, target);
      if (Date.now() - phaseStartTime > maxPhaseRuntime) break;
      await ns.sleep(scriptUpdateDuration);
    }

    // Hack Phase
    await killAll(ns);
    phaseStartTime = Date.now();
    while (ns.getServerMoneyAvailable(target) > maxMoney / 2) {
      await deployToAll(ns, "/basic/hack.js", false, target);
      if (Date.now() - phaseStartTime > maxPhaseRuntime) break;
      await ns.sleep(scriptUpdateDuration);
    }
  }
}

async function getBestServer(ns: NS): Promise<[string, number]> {
  const hackableServers = await getHackableServers(ns);
  let bestServer: [string, number] = ["", 0];

  for (const s of hackableServers) {
    if (s === "home") continue;
    const moneyAvailable = ns.getServerMoneyAvailable(s);
    if (moneyAvailable > bestServer[1]) {
      bestServer = [s, moneyAvailable];
    }
  }

  return bestServer;
}
