import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = [
    "advanced/killall.js",
    "advanced/cpall.js",
    "contracts/daemon.js",
    "stocks/daemon.js",
    "rep/shareall.js",
  ];

  for (const script of scripts) ns.run(script);
}
