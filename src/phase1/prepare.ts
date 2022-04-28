import { NS } from "Bitburner";
import { prepBatch } from "batching/prepBatch";
import { getHackableServers } from "cnct";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const target = getHackableServers(ns)[0].hostname;
  await prepBatch(ns, target);
  ns.spawn("phase1/cheapHack.js", 1, target);
}
