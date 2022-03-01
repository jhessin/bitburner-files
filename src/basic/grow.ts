import { NS } from "Bitburner";

export async function main(ns: NS) {
  const target = ns.args[0].toString();
  await ns.grow(target);
}
