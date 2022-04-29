import { NS } from "Bitburner";

let phase2RAM = 500;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  phase2RAM = ns.getScriptRam("/phase2/restart.js") * 2;

  if (ns.getServerMaxRam("home") > phase2RAM) ns.spawn("phase2/restart.js");

  ns.spawn("/phase1/actions/program.js");
}
