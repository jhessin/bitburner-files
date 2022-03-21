import { NS } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const target = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !target) {
    ns.tprint(`
      Runs the basic hack loop to hack the provided target using the maximum amount of threads required.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} TARGET_SERVER.
      `);
    return;
  }
  while (true) {
    if (
      ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
    ) {
      await ns.weaken(target, {
        threads: Math.min(weakenThreads(ns, target), this.threads),
      });
    } else if (
      ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)
    ) {
      await ns.grow(target, {
        threads: Math.min(growThreads(ns, target), this.threads),
      });
    } else {
      await ns.hack(target, {
        threads: Math.min(hackThreads(ns, target), this.threads),
      });
    }
  }
}

export function hackThreads(ns: NS, server: string) {
  return Math.ceil(0.75 / ns.hackAnalyze(server));
}

export function growThreads(ns: NS, s: string) {
  // get the percentage of the server that is full
  return ns.growthAnalyze(s, 10);
}

export function weakenThreads(ns: NS, server: string) {
  return Math.max(
    Math.ceil(
      (ns.getServerSecurityLevel(server) -
        ns.getServerMinSecurityLevel(server)) /
        ns.weakenAnalyze(1)
    ),
    1
  );
}
