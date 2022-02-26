import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = [
    "advanced/killall.js",
    "advanced/daemon.js",
    "contracts/daemon.js",
    "hacknet/daemon.js",
    "server-expansion/daemon.js",
    "official/custom-stats.js",
    // 'initHacking.ns',
    //
    // This needs work before I start it.
    // "stocks/daemon.js",
  ];

  for (const script of scripts) ns.run(script);
}
