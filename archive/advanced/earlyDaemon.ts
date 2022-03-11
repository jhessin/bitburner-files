import { NS } from "Bitburner";

const minuteInterval = 5;
const nukeScript = "/advanced/nukeall.js";
// const hackScript = "/advanced/hackrichest.js";
const hackScript = "/advanced/work.js";

export async function main(ns: NS) {
  while (true) {
    ns.run(nukeScript);
    while (ns.scriptRunning(nukeScript, "home")) await ns.sleep(1);
    if (!ns.scriptRunning(hackScript, "home")) ns.spawn(hackScript);
    await ns.sleep(minuteInterval * 60 * 1000);
  }
}
