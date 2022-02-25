import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

const minCash = 100;
const bestServerCheckDuration =
  1000 * // = 1 second
  60 * // = 1 minute
  60 * // = 1 hour
  24; // = 1 day
const scriptUpdateDuration =
  1000 * // = 1 second
  60 * // = 1 minute
  60; // = 1 hour

export async function main(ns: NS) {
  await crawl(ns);
}

async function crawl(ns: NS) {
  // Always share!

  // Get common data to compare
  const hackingLevel = ns.getHackingLevel();
  const servers = await getAllServers(ns);
  const hackableServers = servers.filter(
    (s) =>
      ns.getServerRequiredHackingLevel(s) <= hackingLevel &&
      ns.hasRootAccess(s) &&
      ns.getServerMaxMoney(s) >= minCash
  );
  const runnableServers = servers.filter((s) => ns.hasRootAccess(s));

  // Start loop here:
  while (true) {
    // Find the richest server
    let richestServer: [string, number] = ["", 0];
    for (const s of hackableServers) {
      const maxMoney = ns.getServerMaxMoney(s);
      if (maxMoney > richestServer[1]) {
        richestServer = [s, maxMoney];
      }
    }
    const [target, maxMoney]: [string, number] = richestServer;
    // hack/grow/weaken it as appropriate from all servers
    let scriptName = "";
    let startTime = Date.now();

    while (true) {
      let oldScript = scriptName;
      if (ns.getServerMoneyAvailable(target) < maxMoney * 0.75) {
        // if the server has less than 75% their capacity grow it.
        scriptName = "/basic/grownshare.js";
      } else if (ns.hackAnalyzeChance(target) < 0.6) {
        // if we have less than a 60% chance to successfully hack the server
        // weaken it.
        scriptName = "/basic/weaken.js";
      } else {
        // Otherwise we hack the server.
        scriptName = "/basic/hacknshare.js";
      }

      if (scriptName === oldScript) continue;
      for (const host of runnableServers) {
        // Don't hog the home pc
        if (host === "home") continue;
        // kill everything on the host first
        if (ns.scriptRunning(scriptName, host)) continue;
        ns.killall(host);
        ns.run("/official/deploy.js", 1, host, scriptName, target);
        while (ns.scriptRunning("/official/deploy.js", host)) await ns.sleep(1);
      }
      if (Date.now() - startTime > bestServerCheckDuration) {
        break;
      }
      await ns.sleep(scriptUpdateDuration);
    }
  }
}
