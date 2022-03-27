import { NS } from "Bitburner";

const scripts = [
  "hacknet.js",
  "/phase2/cnct.js",
  "/backdoor.js",
  "/phase2/programs.js",
  "/phase2/batchHack.js",
  "/batching/batch.js",
  "/batching/spawner.js",
  "/phase2/expandServer.js",
  "/actions/programming.js",
];

const maxRam = 1e12;

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This will test all phase 1 scripts memory requirements.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  let pass = true;
  let failedScripts: string[] = [];

  for (const script of scripts) {
    const ram = ns.getScriptRam(script, "home") * 1e9;
    if (ram > maxRam) {
      pass = false;
      failedScripts.push(script);
      ns.tprint(
        `${script} requires ${ns.nFormat(ram, "0.00b")} RAM - that's too much!`
      );
    } else {
      ns.tprint(`${script} only requires ${ns.nFormat(ram, "0.00b")} RAM`);
    }
  }

  if (!pass) {
    ns.tprint(
      `FAIL! You still need to work on these scripts:
      ${failedScripts}`
    );
  } else {
    ns.tprint("SUCCESS!");
  }
}
