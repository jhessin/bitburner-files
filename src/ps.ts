import { AutocompleteData, NS, ProcessInfo, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

export interface iPS {
  ps: ProcessInfo;
  server: Server;
}

export async function main(ns: NS) {
  const grep = ns.args.join(" ");
  for (const proc of ps(ns).filter(
    (p) =>
      p.ps.filename.includes(grep) ||
      p.ps.args.includes(grep) ||
      p.server.hostname.includes(grep)
  )) {
    const { ps, server } = proc;
    const memory = ps.threads * ns.getScriptRam(ps.filename, server.hostname);
    ns.tprint(
      `${ps.filename}:
      ${ps.args} @ ${server.hostname}
      Memory: ${ns.nFormat(memory * 1e9, "0.0b")}`
    );
  }
}

// Returns a list of { ps, server }'s. Containing every running process.'
export function ps(ns: NS) {
  let processes: iPS[] = [];
  const tree = new ServerTree(ns);

  for (const server of tree.home.list()) {
    for (const ps of ns.ps(server.hostname)) {
      processes.push({
        ps,
        server,
      });
    }
  }
  return processes;
}

export function autocomplete(data: AutocompleteData) {
  return [...data.servers, ...data.scripts];
}
