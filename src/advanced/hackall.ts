import { NS, Server } from "Bitburner";
import { getHackableServers } from "lib/getall";
import { deployToAll } from "lib/deploy";
import { killAll } from "advanced/killall";
import { analyzeServer } from "lib/analyze_server";

const bestServerCheckDuration =
  1000 * // = 1 second
  60 * // = 1 minute
  60 * // = 1 hour
  24; // = 1 day
const scriptUpdateDuration = 1000; // = 1 second
const maxPhaseRuntime =
  1000 * // = 1 second
  60 * // = 1 minute
  60; // = 1 hour

export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  let target: Server = await getBestServer(ns);
  // let scriptStartTime = Date.now();
  while (true) {
    ns.tprint(`${target.hostname} chosen as the hacking target.`);
    ns.print(`${target.hostname} chosen as the hacking target.`);
    // Growth Phase
    ns.tprint("Begining growth phase.");
    ns.print("Begining growth phase.");
    await killAll(ns);
    ns.scriptKill("/basic/weaken.js", "home");
    ns.scriptKill("/basic/hack.js", "home");
    let phaseStartTime = Date.now();
    analyzeServer(ns, target.hostname, false);
    while (target.moneyAvailable < target.moneyMax) {
      await deployToAll(ns, "/basic/grow.js", false, target.hostname);
      if (Date.now() - phaseStartTime > maxPhaseRuntime) {
        ns.print("Max phase time reached!");
        break;
      }
      await ns.sleep(scriptUpdateDuration);
    }

    // Weaken Phase
    ns.tprint("Beginning Weaken Phase");
    ns.print("Beginning Weaken Phase");
    await killAll(ns);
    ns.scriptKill("/basic/grow.js", "home");
    ns.scriptKill("/basic/hack.js", "home");
    phaseStartTime = Date.now();
    analyzeServer(ns, target.hostname, false);
    while (ns.hackAnalyzeChance(target.hostname) < 1) {
      await deployToAll(ns, "/basic/weaken.js", false, target.hostname);
      if (Date.now() - phaseStartTime > maxPhaseRuntime) {
        ns.print("Max phase time reached!");
        break;
      }
      await ns.sleep(scriptUpdateDuration);
    }

    // Hack Phase
    ns.tprint("Benninging Hack Phase");
    ns.print("Benninging Hack Phase");
    analyzeServer(ns, target.hostname, false);
    await killAll(ns);
    ns.scriptKill("/basic/weaken.js", "home");
    ns.scriptKill("/basic/grow.js", "home");
    while (
      ns.getServerMoneyAvailable(target.hostname) >
      ns.getServerMaxMoney(target.hostname) / 2
    ) {
      await deployToAll(ns, "/basic/hack.js", false, target.hostname);
      await ns.sleep(scriptUpdateDuration);
    }
    await ns.sleep(bestServerCheckDuration);
    target = await getBestServer(ns);
  }
}

async function getBestServer(ns: NS): Promise<Server> {
  const hackableServers = await getHackableServers(ns);
  let bestServer: [string, number] = ["", 0];

  for (const s of hackableServers) {
    if (s === "home") continue;
    let growth = xpPerSecond(ns, s);
    if (growth > bestServer[1]) {
      bestServer = [s, growth];
    }
  }
  return ns.getServer(bestServer[0]);
}

function cashPerSecond(ns: NS, server: string): number {
  let hackTime = ns.formulas.hacking.hackTime(
    ns.getServer(server),
    ns.getPlayer()
  );
  let moneyAvailable = ns.getServerMaxMoney(server);
  return moneyAvailable / hackTime;
}

function xpPerSecond(ns: NS, s: string): number {
  // requires formulas
  if (!ns.fileExists("Formulas.exe", "home")) {
    // TODO: Create a function that analyzes growth without Formulas and use it
    // here.
    return cashPerSecond(ns, s);
  }
  const server = ns.getServer(s);
  const player = ns.getPlayer();
  const hacking = ns.formulas.hacking;
  let hack = hacking.hackTime(server, player);
  let hackXP = hacking.hackExp(server, player);
  let grow = hacking.growTime(server, player);
  let weaken = hacking.weakenTime(server, player);
  return hackXP / (hack + grow + weaken + grow);
}
