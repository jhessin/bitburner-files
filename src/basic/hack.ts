import { NS } from "Bitburner";

export async function main(ns: NS) {
  const target = ns.args[0].toString();
  while (
    ns.getServerSecurityLevel(target) >
    ns.getServerMinSecurityLevel(target) + 5
  )
    await ns.weaken(target);

  while (true) {
    await ns.weaken(target);
    await ns.weaken(target);
    await ns.grow(target);
    await ns.weaken(target);
    await ns.hack(target);
  }
}
