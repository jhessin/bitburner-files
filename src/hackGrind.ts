import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = [
    "advanced/killall.js",
    "basic/cpall.js",
    "advanced/daemon.js",
  ];

  for (const script of scripts) ns.run(script);
}
