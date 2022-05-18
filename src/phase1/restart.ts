import { NS } from "Bitburner";

export function phase2RAM(ns: NS) {
  return ns.getScriptRam("/phase2/restart.js") * 2;
}

export async function main(ns: NS) {
  ns.disableLog("ALL");

  if (ns.getServerMaxRam("home") > phase2RAM(ns)) ns.spawn("phase2/restart.js");

  ns.spawn("/phase1/expandServer.js");
}
