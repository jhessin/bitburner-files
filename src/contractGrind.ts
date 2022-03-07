import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = ["contracts/daemon.js", "official/custom-stats.js"];

  for (const script of scripts) ns.run(script);
}
