import { NS } from "Bitburner";
import { prepBatch } from "batching/prepBatch";
import { getHackableServers } from "cnct";
import { kill } from "utils/scriptKilling";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const target = getHackableServers(ns)[0].hostname;
  kill(ns, (ps) => ps.filename === "/phase1/monitor.js");
  ns.run("/phase1/monitor.js", 1, target);
  await prepBatch(ns, target);
  ns.spawn("phase1/cheapHack.js", 1, target);
}
