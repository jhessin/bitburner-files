import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";
import { analyzeServer } from "lib/analyze_server";

export async function main(ns: NS) {
  analyzeServer(ns, await getFastestServer(ns), true);
}

export async function getFastestServer(ns: NS) {
  let fastest: [string, number] = ["", 1e500];

  for (const s of await getHackableServers(ns)) {
    const time = ns.getHackTime(s) + ns.getGrowTime(s) + ns.getWeakenTime(s);
    if (time < fastest[1]) {
      fastest = [s, time];
    }
  }
  return fastest[0];
}
