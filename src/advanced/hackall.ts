import { NS } from "Bitburner";
import { getAllServers } from "lib/getall";

const minCash = 100;

export async function main(ns: NS) {
  const flags = ns.flags([["share", false]]);
  await crawl(ns, flags.share);
}

async function crawl(ns: NS, shouldShare: boolean) {
  // Always share!
  shouldShare = true;
  const hackingLevel = ns.getHackingLevel();
  const servers = await getAllServers(ns);
  const hackableServers = servers.filter(
    (s) =>
      ns.getServerRequiredHackingLevel(s) <= hackingLevel &&
      ns.hasRootAccess(s) &&
      ns.getServerMaxMoney(s) >= minCash
  );
  const runnableServers = servers.filter((s) => ns.hasRootAccess(s));

  const scriptName = shouldShare ? "/basic/hacknshare.js" : "/basic/hack.js";

  for (const host of runnableServers) {
    // Don't hog the home pc
    // if (host === 'home') continue;

    ns.run("/basic/cpall.js", 1, host);
    if (ns.getServerRequiredHackingLevel(host) < hackingLevel) {
      // Requires source File
      // ns.exec('basic/backdoor.js', host);
    }
    for (let target of hackableServers) {
      if (ns.isRunning(scriptName, host, target)) {
        continue;
      }
      // ns.tprint(`Hacking ${target} from ${host}`)
      if (!ns.exec(scriptName, host, 1, target)) break;
      await ns.sleep(1);
    }
  }
}
