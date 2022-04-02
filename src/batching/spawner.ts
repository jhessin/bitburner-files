import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";
import { ServerTree } from "utils/ServerTree";

const cnctScript = "cnct.js";
const bkdrScript = "bkdr.js";

// time constants
// const second = 1000;
// const seconds = second;
// const minute = 60 * seconds;
// const minutes = minute;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const cmd = args._[0] as string;
  const target = args._[1] as string;
  const threads = args._[2] as number;
  const bufferTime = args._[3] as number;
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (
    args.help ||
    !cmd ||
    !["hack", "grow", "weaken"].includes(cmd.toLowerCase()) ||
    !target ||
    !threads ||
    !bufferTime
  ) {
    ns.tprint(`
      Repeatedly spawns weakens on a server.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} HOST TARGET THREADS BUFFERTIME
      `);
    return;
  }

  let scriptName = `/batching/${cmd}.js`;
  let threadsLeft = threads;

  // calculate the memory.
  while (true) {
    // copy script to all servers (even those that have been purchased recently.)
    const tree = new ServerTree(ns);
    for (const host of tree.home.list()) {
      await ns.scp(scriptName, host.hostname);
    }

    const threadsUsed = spawnScript(ns, scriptName, threads, target);
    ns.clearLog();
    if (threadsUsed === 0) {
      ns.print(`No host with enough ram to run ${scriptName}.`);
      await ns.sleep(1);
      continue;
    }
    threadsLeft -= threadsUsed;
    if (threadsLeft <= 0) {
      threadsLeft = threads;
      await ns.sleep(bufferTime);
    }
  }
}

// Spawns a given script on the server with the most free ram up to a maximum
// number of threads. Returns the number of threads that were spawned or 0 if
// none could be spawned.
function spawnScript(
  ns: NS,
  script: string,
  maxThreads: number,
  target: string
) {
  for (const host of getRunnableServers(ns)) {
    // calculate available ram
    const ramAvailable =
      host.maxRam - host.ramUsed - reservedRam(ns, host.hostname);
    // calculate threads to use
    const threads = Math.min(
      maxThreads,
      Math.floor(ramAvailable / ns.getScriptRam(script))
    );
    // run the script
    ns.print(`Launching ${script} on ${host.hostname} with target ${target}`);
    if (
      threads > 0 &&
      ns.exec(script, host.hostname, threads, target, Date.now())
    )
      // if successfully run return the number of threads used
      return threads;
  }
  return 0;
}

function reservedRam(ns: NS, host: string) {
  return host === "home"
    ? Math.max(ns.getScriptRam(cnctScript), ns.getScriptRam(bkdrScript))
    : 0;
}
