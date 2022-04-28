import { NS } from "Bitburner";
import { expandHacknet } from "hacknet";

export async function main(ns: NS) {
  expandHacknet(ns);

  ns.spawn("phase1/restart.js");
}
