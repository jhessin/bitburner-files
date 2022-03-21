import { NS } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(
      "This script will share computer resources with your faction until manually stopped."
    );
    return;
  }
  while (true) {
    await ns.share();
  }
}
