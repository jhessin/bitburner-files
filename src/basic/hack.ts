import { NS } from "Bitburner";

export async function main(ns: NS) {
  const host = ns.args[0].toString();

  while (true) {
    await basicHack(ns, host);
  }
}

async function basicHack(ns: NS, host: string) {
  await ns.share();
  await ns.hack(host);
}
