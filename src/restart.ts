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

  const homeRAM = ns.getServerMaxRam("home") * 1e9;
  const minRAM = getMinRam(ns) * 1e9;
  const totalRAM = getTotalRam(ns) * 1e9;
  const purchasedServerMaxRAM = ns.getPurchasedServerMaxRam() * 1e9;

  ns.tprint(`
    Home RAM: ${ns.nFormat(homeRAM, "0.0b")}
    Min RAM: ${ns.nFormat(minRAM, "0.0b")}
    Total RAM: ${ns.nFormat(totalRAM, "0.0b")}
    Purchased Server MAX RAM: ${ns.nFormat(purchasedServerMaxRAM, "0.0b")}
    `);

  // test for phase3
  if (minRAM >= purchasedServerMaxRAM) {
    ns.spawn("/phase3/restart.js");
  }

  // test for phase2
  if (homeRAM >= 128 && totalRAM > 1e3) {
    // phase2
    ns.spawn("/phase2/restart.js");
  }

  // if all else fails run phase1
  ns.spawn("/phase1/restart.js");
}

function getTotalRam(ns: NS) {
  let total = ns.getServerMaxRam("home");
  if (ns.getPurchasedServers().length === 0) return total;
  for (const ram of ns.getPurchasedServers().map((s) => ns.getServerMaxRam(s)))
    total += ram;
  return total;
}
