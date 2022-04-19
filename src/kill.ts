import { NS, AutocompleteData } from "Bitburner";
import { ps } from "ps";

export async function main(ns: NS) {
  for (const proc of ps(ns)) {
    if (
      proc.ps.args.includes(ns.args[0] as string) ||
      proc.ps.filename.includes(ns.args[0] as string)
    ) {
      ns.kill(proc.ps.pid);
    }
  }
}

export function autocomplete(data: AutocompleteData) {
  return [...data.scripts, ...data.servers];
}
