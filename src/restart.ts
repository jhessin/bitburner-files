import { NS } from "Bitburner";
import { getMinRam } from "purchase";
import { kill } from "utils/scriptKilling";

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
  kill(ns, (ps) => ps.filename !== ns.getScriptName());
  if (ns.getServerMaxRam("home") >= 128 && getTotalRam(ns) > 1e3) {
    // phase1
    ns.spawn("/phase2/restart.js");
  }

  if (getMinRam(ns) >= ns.getPurchasedServerMaxRam()) {
    // phase2
    ns.spawn("/phase3/restart.js");
  }

  ns.spawn("/phase1/restart.js");
}

function getTotalRam(ns: NS) {
  let total = ns.getServerMaxRam("home");
  if (ns.getPurchasedServers().length === 0) return total;
  for (const ram of ns.getPurchasedServers().map((s) => ns.getServerMaxRam(s)))
    total += ram;
  return total;
}
