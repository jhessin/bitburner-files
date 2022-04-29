import { NS } from "Bitburner";

const scripts = [
  "/phase1/restart.js",
  "/phase1/nuke.js",
  "/phase1/work.js",
  "/phase1/prepare.js",
  "/phase1/cheapHack.js",
  "/phase1/actions/findAug.js",
  "/phase1/actions/purchaseAug.js",
  "/phase1/actions/backdoor.js",
  "/phase1/actions/companyWork.js",
  "/phase1/actions/crime.js",
  "/phase1/actions/factionHunt.js",
  "/phase1/actions/factionWork.js",
  "/phase1/actions/program.js",
  //
];

const commonScripts = ["/phase1/monitor.js"];

let maxRam = 32;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  for (const commonScript of commonScripts)
    maxRam -= ns.getScriptRam(commonScript);
  while (true) {
    ns.clearLog();
    ns.tail();
    ns.print(`Phase 1 Tests`);
    ns.print(`Max Ram = ${ns.nFormat(maxRam * 1e9, "0.0b")}`);
    ns.print(`=============`);
    for (const script of scripts) {
      const ram = ns.getScriptRam(script);
      ns.print(`${script} :
        ${
          ram > maxRam
            ? `Ram Over     : ${ns.nFormat((ram - maxRam) * 1e9, "0.0b")} FAIL!`
            : `Ram Under    : ${ns.nFormat(
                (maxRam - ram) * 1e9,
                "0.0b"
              )} SUCCESS!`
        }`);
    }
    await ns.sleep(1);
  }
}
