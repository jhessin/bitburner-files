import { NS } from "Bitburner";

const minuteInterval = 5;
const nukeScript = "/advanced/nukeall.js";
const hackScript = "/advanced/hackall.js";

export async function main(ns: NS) {
  while (true) {
    ns.run(nukeScript);
    while (ns.isRunning(nukeScript, "home")) await ns.sleep(1);
    if (!ns.scriptRunning(hackScript, "home")) ns.run(hackScript, 1, "--share");
    await ns.sleep(minuteInterval * 60 * 1000);
  }
}
