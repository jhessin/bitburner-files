import { NS } from "Bitburner";

const scripts = [
  "/phase1/restart.js",
  "/phase1/nuke.js",
  "/phase1/work.js",
  "/phase1/prepare.js",
  "/phase1/cheapHack.js",
  //
];

const commonScript = "/phase1/monitor.js";

let maxRam = 32;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  maxRam -= ns.getScriptRam(commonScript);
  while (true) {
    ns.clearLog();
    ns.tail();
    ns.print(`Phase 1 Tests`);
    ns.print(`Max Ram = ${ns.nFormat(maxRam * 1e9, "0.0b")}`);
    ns.print(`=============`);
    for (const script of scripts) {
      const ram = ns.getScriptRam(script);
      ns.print(`
    ${script} :
        ram     : ${ns.nFormat(ram * 1e9, "0.0b")} ${
        ram > maxRam ? "FAIL!" : "SUCCESS!"
      }
        `);
    }
    await ns.sleep(1);
  }
}
