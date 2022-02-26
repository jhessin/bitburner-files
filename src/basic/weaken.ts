import { NS } from "Bitburner";

export async function main(ns: NS) {
  const target = ns.args[0].toString();
  while (true) {
    await ns.share();
    await ns.weaken(target);
    await ns.weaken(target);
  }
}
