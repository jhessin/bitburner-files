import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scripts = ["hacknet/daemon.js", "server-expansion/daemon.js"];

  for (const script of scripts) ns.run(script);
}
