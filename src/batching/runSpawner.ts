import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";
import { phase2RAM } from "phase1/restart";

export const spawnerName = "/batching/spawner.js";

const killScripts = [
  "/batching/weaken.js",
  "/batching/grow.js",
  "/batching/hack.js",
];

export async function runSpawner(
  ns: NS,
  cmd: string,
  target: string,
  threads: number,
  bufferTime: number,
  index: number = 0
) {
  let host = getRunnableServers(ns).filter(
    (s) => ns.getServerMaxRam("home") > phase2RAM(ns) || s.hostname !== "home"
  )[0];

  await ns.scp(spawnerName, "home", host.hostname);
  for (const script of killScripts) {
    ns.scriptKill(script, host.hostname);
  }

  if (
    !ns.exec(
      spawnerName,
      host.hostname,
      1,
      cmd,
      target,
      threads,
      bufferTime,
      index
    )
  ) {
    await ns.sleep(1);
    await runSpawner(ns, cmd, target, threads, bufferTime);
  }
}
