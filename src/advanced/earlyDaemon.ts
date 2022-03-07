import { NS } from "Bitburner";

const minuteInterval = 5;
const nukeScript = "/advanced/nukeall.js";
const hackScript = "/advanced/hackrichest.js";

export async function main(ns: NS) {
  ns.run(nukeScript);
  while (ns.isRunning(nukeScript, "home")) await ns.sleep(1);
  while (true) {
    if (!ns.scriptRunning(hackScript, "home")) ns.run(hackScript);
    await ns.sleep(minuteInterval * 60 * 1000);
  }
}
