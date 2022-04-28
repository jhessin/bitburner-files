import { NS } from "Bitburner";

export async function main(ns: NS) {
  const host = ns.args[0] as string;

  while (true) {
    await ns.hack(host);
    await ns.weaken(host);
    await ns.grow(host);
    await ns.weaken(host);
  }
}
