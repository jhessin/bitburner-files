import { NS } from "Bitburner";
import { getHackableServers, getRunnableServers } from "cnct";
import { kill } from "utils/scriptKilling";

const scriptName = "weaken.js";
const killScripts = ["hack.js", "grow.js"];

export async function main(ns: NS) {
  await weakenAll(ns);
}

export async function weakenAll(ns: NS) {
  const servers = getRunnableServers(ns);
  const target = getHackableServers(ns)[0];
  // kill any previous scripts with other targets
  kill(
    ns,
    (ps) =>
      (!ps.args.includes(target.hostname) && ps.filename === scriptName) ||
      killScripts.includes(ps.filename)
  );
  for (const { hostname } of servers) {
    await ns.scp(scriptName, hostname);
    // calculate the maximum threads
    const maxThreads = Math.floor(
      (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) /
        ns.getScriptRam(scriptName, hostname)
    );
    if (maxThreads > 0)
      ns.exec(scriptName, hostname, maxThreads, target.hostname);
  }
}