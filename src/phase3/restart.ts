import { NS } from "Bitburner";

const scripts = [
  "hacknet.js",
  "/contracts/start.js",
  "/phase3/batchHack.js",
  "/phase3/backdoor.js",
  "/phase3/programs.js",
  "/phase3/purchase.js",
];

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This is a simple script that restarts the automated scripts periodically.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} ARGS_HERE
      `);
    return;
  }

  while (true) {
    killall(ns);
    for (const script of scripts) {
      ns.scriptKill(script, "home");
      ns.run(script);
    }
    await ns.sleep(60 * 60 * 1000);
  }
}

function killall(ns: NS) {
  const host = ns.getHostname();
  const runningScripts = ns.ps(host);
  for (const script of runningScripts) {
    if (script.filename === ns.getScriptName()) continue;
    ns.scriptKill(script.filename, host);
  }
}
