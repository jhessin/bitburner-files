import { NS, Server } from "Bitburner";
import { getHackableServers, getRunnableServers } from "cnct";
import { prepareServer as prepBatch } from "batching/batchLite";
import { nukeAll } from "nuker";

// const hackScript = "hack.js";
const weakenScript = "weaken.js";
const growScript = "grow.js";

enum Phase {
  Grow = "Grow",
  Weaken = "Weaken",
  Hack = "Hack",
}

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

  // first nuke everything
  await nukeAll(ns);

  // find the richest server.
  let richest: Server = getHackableServers(ns)[0];

  if (!richest) {
    ns.tprint(`ERROR! You don't have any servers!`);
    return;
  }

  let phase: Phase = Phase.Weaken;

  async function runPhase(phase: Phase) {
    ns.print(`Starting ${phase} phase`);
    serverStatus(ns, richest.hostname);
    for (const server of getRunnableServers(ns)) {
      if (!server) continue;
      if (server.hostname !== "home") ns.killall(server.hostname);
      let currentScripts = [growScript, weakenScript];
      switch (phase) {
        case Phase.Grow:
          await prepBatch(ns, richest.hostname);
          break;
        case Phase.Weaken:
          currentScripts = [weakenScript];
          await prepBatch(ns, richest.hostname);
          break;
        case Phase.Hack:
          ns.spawn("batching/batchLite.js", 1, richest.hostname);
      }
      await ns.scp(currentScripts, server.hostname);

      const currentScriptsRam = Sum(
        currentScripts.map((script) => ns.getScriptRam(script))
      );
      // calculate the maximum number of threads.
      let maxThreads = Math.floor(
        server.hostname === "home"
          ? server.maxRam -
              server.ramUsed -
              getReservedRam(ns) / currentScriptsRam
          : server.maxRam / currentScriptsRam
      );
      // hack the richest server
      if (maxThreads > 0)
        for (const script of currentScripts) {
          ns.exec(script, server.hostname, maxThreads, richest.hostname);
        }
    }
  }

  while (phase !== Phase.Hack) {
    // copy the hack script to all the servers we have admin priveledges to.
    const oldPhase = phase;
    await runPhase(phase);
    while (phase === oldPhase) {
      await ns.sleep(1);
      ns.clearLog();
      ns.tail();
      ns.print(`Current phase: ${phase}`);
      serverStatus(ns, richest.hostname);
      // update the phase
      if (
        ns.getServerSecurityLevel(richest.hostname) >
        ns.getServerMinSecurityLevel(richest.hostname)
      )
        phase = Phase.Weaken;
      else if (
        ns.getServerMoneyAvailable(richest.hostname) <
        ns.getServerMaxMoney(richest.hostname)
      )
        phase = Phase.Grow;
      else phase = Phase.Hack;
    }
  }

  // Hack phase.
  await runPhase(Phase.Hack);
}

function getReservedRam(ns: NS) {
  return Math.max(ns.getScriptRam("cnct.js"), ns.getScriptRam("bkdr.js"));
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

function Sum(elements: number[]) {
  let total = 0;
  for (const e of elements) {
    total += e;
  }
  return total;
}
