import { NS } from "Bitburner";

export async function main(ns: NS) {
  const target = ns.args[0].toString();

  while (true) {
    while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target))
      await ns.grow(target, {
        threads: Math.min(growThreads(ns, target), this.threads),
      });
    while (
      ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
    )
      await ns.weaken(target, {
        threads: Math.min(weakenThreads(ns, target), this.threads),
      });

    await ns.hack(target, { threads: hackThreads(ns, target) });
  }
}

export function hackThreads(ns: NS, server: string) {
  return Math.ceil(0.75 / ns.hackAnalyze(server));
}

export function hackTime(ns: NS, host: string) {
  return ns.getHackTime(host);
}

export function growThreads(ns: NS, s: string) {
  // get the percentage of the server that is full
  return ns.growthAnalyze(s, 10);
}

export function growTime(ns: NS, host: string) {
  return ns.getGrowTime(host);
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
