import { NS } from "Bitburner";

export async function main(ns: NS) {
  while (true) {
    await ns.share();
  }
}
