import { NS } from "Bitburner";

const scripts = [
  "/cnct.js",
  "/backdoor.js",
  "/phase1/programs.js",
  "/phase1/expandServer.js",
  "/phase1/basicHack.js",
  "/phase1/actions/programming.js",
];

const maxRam = 32;

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
    const ram = ns.getScriptRam(script);
    if (ram > maxRam) {
      pass = false;
      failedScripts.push(script);
      ns.tprintf(
        "%s requires %s RAM - that's too much!",
        script,
        ns.nFormat(ram, "0.00b")
      );
    } else {
      ns.tprintf("%s only requires %s RAM!", script, ns.nFormat(ram, "0.00b"));
    }
  }

  if (!pass) {
    ns.tprint(
      `You still need to work on these scripts:
      ${failedScripts}`
    );
  } else {
    ns.tprint("SUCCESS!");
  }
}
