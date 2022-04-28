import { NS } from "Bitburner";
// import { getHackableServers, getRunnableServers } from "cnct";
// import { commitCrime } from "actions/crime";
// import { expandServer } from "expandServer";
// import { expandHacknet } from "hacknet";
// import { factionWatch } from "factionWatch";
import { nukeAll } from "nuker";

// timing constants
// const second = 1000; //milliseconds
// const seconds = second;
// const minute = 60 * seconds;
// const minutes = minute;
// const hour = 60 * minutes;
// const hours = hour;
// const day = 24 * hours;
// const days = day;

const phase2RAM = 500;

export async function main(ns: NS) {
  ns.disableLog("ALL");

  if (getTotalRam(ns) > phase2RAM) ns.spawn("phase2/restart.js");

  // await nukeAll(ns);

  ns.spawn("/phase1/nuke.js");

  // THIS IS GUARANTEED TO WORK ON A FRESH BITNODE
  // while (true) {
  //   // await cheapHack(ns);
  //   await commitCrime(ns);
  //   ns.clearLog();
  //   ns.tail();
  //   // monitor(ns);
  //   ns.print(
  //     `
  //     Hack Profit     : ${ns.nFormat(ns.getScriptIncome()[0], "$0.0a")} / sec.
  //     Hack XP         : ${ns.nFormat(ns.getScriptExpGain(), "0.0a")} / sec.
  //     Home RAM        : ${ns.nFormat(ns.getServerMaxRam("home") * 1e9, "0.0b")}
  //     Servers Owned   : ${ns.getPurchasedServers().length}
  //     Total RAM       : ${ns.nFormat(getTotalRam(ns) * 1e9, "0.0b")}
  //     Phase 2 RAM     : ${ns.nFormat(phase2RAM * 1e9, "0.0b")}
  // `
  //   );
  //   expandServer(ns);
  //   // factionWatch(ns);
  //   expandHacknet(ns);
  //   if (getTotalRam(ns) > phase2RAM) ns.spawn("phase2/restart.js");
  // }
}

function getTotalRam(ns: NS) {
  let total = ns.getServerMaxRam("home");
  for (const host of ns.getPurchasedServers()) {
    total += host ? ns.getServerMaxRam(host) : 0;
  }
  return total;
}
