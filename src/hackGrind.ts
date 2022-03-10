import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = [
    "advanced/killall.js",
    "basic/cpall.js",
    "official/custom-stats.js",
    "contracts/daemon.js",
    "advanced/daemon.js",
  ];

  for (const script of scripts) ns.run(script);
}
