import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";

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
  let host = getRunnableServers(ns)[0];

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
  )
    await runSpawner(ns, cmd, target, threads, bufferTime);
}
