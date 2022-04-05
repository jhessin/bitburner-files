import { NS } from "Bitburner";
import { getRunnableServers } from "cnct";

export const spawnerName = "/batching/spawner.js";

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
    ns.tprint(`ERROR! unable to run spawner on host: ${host.hostname}`);
}
