import { NS, ProcessInfo } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

export enum Scope {
  ALL = "ALL",
  HOME = "HOME",
  OTHER = "OTHER",
}

export async function main(ns: NS) {
  let serverScope = ns.args[0] as Scope;
  let scriptScope = ns.args[1] as Scope | Scope.OTHER;
  killScripts(ns, serverScope, scriptScope);
}

export function killScripts(
  ns: NS,
  serverScope: Scope,
  scriptScope: Scope = Scope.OTHER
) {
  const tree = new ServerTree(ns);
  switch (serverScope) {
    case Scope.HOME:
      switch (scriptScope) {
        case Scope.ALL:
          ns.killall("home");
          break;
        default:
          // default to OTHER
          for (const ps of ns.ps("home")) {
            if (ps.filename === ns.getScriptName() && ps.args === ns.args)
              continue;
            ns.kill(ps.pid);
          }
      }
      break;
    case Scope.OTHER:
      for (const s of tree.home.filter((s) => s.hostname !== "home")) {
        ns.killall(s.hostname);
      }
      break;

    case Scope.ALL:
      for (const s of tree.home.list()) {
        switch (scriptScope) {
          case Scope.ALL:
            for (const ps of ns.ps(s.hostname)) {
              if (ps.filename === ns.getScriptName() && ps.args === ns.args)
                continue;
              ns.kill(ps.pid);
            }
            break;
          default:
            // default to other
            for (const ps of ns.ps(s.hostname)) {
              if (
                ps.filename === ns.getScriptName() &&
                JSON.stringify(ps.args) === JSON.stringify(ns.args)
              )
                continue;
              ns.kill(ps.pid);
            }
        }
      }
      ns.killall(ns.getHostname());
      break;

    default:
  }
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
