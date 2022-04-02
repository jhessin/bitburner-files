import { NS, ProcessInfo } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

// ONLY USE FOR TESTING
export async function main(ns: NS) {
  ns.tprint(
    `This script doesn't do anything right now. Call a function from it if you want to use it.`
  );
}

export function kill(
  ns: NS,
  predicate: (ps: ProcessInfo, server: string) => boolean
) {
  const tree = new ServerTree(ns);
  const processes: [ProcessInfo, string][] = [];
  for (const server of tree.home.list()) {
    for (const ps of ns.ps(server.hostname)) {
      processes.push([ps, server.hostname]);
    }
  }
  for (const [ps, server] of processes) {
    if (predicate(ps, server)) ns.kill(ps.pid);
  }
}
