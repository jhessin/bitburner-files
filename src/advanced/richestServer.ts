import { NS } from "Bitburner";
import { getHackableServers } from "lib/getall";
import { analyzeServer } from "lib/analyze_server";

export async function main(ns: NS) {
  let richest: [string, number] = ["", 0];

  for (const s of await getHackableServers(ns)) {
    const money = ns.getServerMaxMoney(s);
    if (money > richest[1]) {
      richest = [s, money];
    }
  }

  analyzeServer(ns, richest[0], true);
}
