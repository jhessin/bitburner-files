import { NS } from "Bitburner";
import { nukeAll } from "nuker";
import { getHackableServers, getRunnableServers } from "cnct";
import { expandServer } from "expandServer";
// import { createPrograms } from "programs";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  await cheapHack(ns);
  ns.spawn("phase1/restart.js");
}

export async function cheapHack(ns: NS) {
  await nukeAll(ns);
  const target = getHackableServers(ns)[0].hostname;

  // deploy to all servers.
  for (const { hostname } of getRunnableServers(ns)) {
    if (!hostname || hostname === "home") continue;
    if (!ns.isRunning("hack.js", hostname, target)) ns.killall(hostname);
    await ns.scp("hack.js", "home", hostname);

    // calculate maxThreads
    const maxThreads =
      Math.floor(
        (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) /
          ns.getScriptRam("hack.js")
      ) || 1;
    ns.exec("hack.js", hostname, maxThreads, target);
  }

  ns.run("/phase1/monitor.js", 1, target);
  expandServer(ns);
  await nukeAll(ns);
  await ns.sleep(5000);
}
