import { NS, Server } from "Bitburner";
import { getHackableServers } from "cnct";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      Hacks the richest server from every available server.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // find the richest server.
  let richest: Server = getHackableServers(ns)[0];

  if (!richest) {
    ns.tprint(`ERROR! You don't have any servers!`);
    return;
  }

  // prepare the target server
  if (!ns.isRunning("batching/prepBatch.js", "home", richest.hostname))
    ns.run("batching/prepBatch.js", 1, richest.hostname);
  while (ns.isRunning("batching/prepBatch.js", "home", richest.hostname)) {
    serverStatus(ns, richest.hostname);
    await ns.sleep(1);
  }
  ns.spawn("batching/batch.js", 1, richest.hostname);
}

function serverStatus(ns: NS, host: string) {
  const currentSecurity = ns.getServerSecurityLevel(host);
  const minSecurity = ns.getServerMinSecurityLevel(host);
  const currentCash = ns.getServerMoneyAvailable(host);
  const maxCash = ns.getServerMaxMoney(host);

  ns.print(`${host}:
  Cash: ${ns.nFormat(currentCash, "$0.000a")}/${ns.nFormat(
    maxCash,
    "$0.000a"
  )}(${ns.nFormat(currentCash / maxCash, "0.0%")})
  Security: ${minSecurity} / ${currentSecurity} (${ns.nFormat(
    minSecurity / currentSecurity,
    "0.0%"
  )})
  `);
}
