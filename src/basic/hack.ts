import { NS } from "Bitburner";

export async function main(ns: NS) {
  const host = ns.args[0].toString();

  await ns.hack(host);
}
