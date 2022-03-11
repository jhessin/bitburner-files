import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = [
    "/advanced/killall.js",
    "/basic/cpall.js",
    "/hacknet/daemon.js",
    // "/server-expansion/daemon.js",
    "/advanced/earlyDaemon.js",
  ];

  for (const script of scripts) ns.run(script);
}
