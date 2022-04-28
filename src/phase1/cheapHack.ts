import { NS } from "Bitburner";
import { nukeAll } from "nuker";
import { getHackableServers, getRunnableServers } from "cnct";
import { kill } from "utils/scriptKilling";
import { expandServer } from "expandServer";

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
    ns.killall(hostname);
    await ns.scp("hack.js", "home", hostname);

    // calculate maxThreads
    const maxThreads = Math.floor(
      (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) /
        ns.getScriptRam("hack.js")
    );
    ns.exec("hack.js", hostname, maxThreads, target);
  }

  while (getHackableServers(ns)[0].hostname === target) {
    ns.clearLog();
    // // TODO: add programing here. //
    // TODO: add expand server here //
    expandServer(ns);
    await nukeAll(ns);
    await ns.sleep(1);
  }
}
