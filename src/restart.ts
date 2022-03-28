import { NS } from "Bitburner";
import { killScripts, Scope } from "utils/scriptKilling";

const singularityScripts = [
  "/phase1/expandServer.js",
  //
];

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This is a script that will detect which phase you are in and restart your hacking scripts.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  // kill all scripts to start.
  killScripts(ns, Scope.ALL);
  if (
    ns.getOwnedSourceFiles().filter((sf) => sf.n === 4).length > 0 ||
    ns.getPlayer().bitNodeN === 4
  )
    for (const script of singularityScripts) {
      ns.scriptKill(script, ns.getHostname());
      ns.run(script);
    }
  if (ns.getServerMaxRam("home") < 1e3) {
    // phase1
    ns.spawn("/phase1/restart.js");
  }

  if (ns.getPurchasedServers().length < 3) {
    // phase2
    ns.spawn("/phase2/restart.js");
  }

  ns.spawn("/phase3/restart.js");
}
