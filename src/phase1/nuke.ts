import { NS } from "Bitburner";
import { nukeAll } from "nuker";

export async function main(ns: NS) {
  await nukeAll(ns);
  ns.spawn("phase1/actions/backdoor.js");
}
