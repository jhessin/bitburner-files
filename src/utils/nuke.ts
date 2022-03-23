import { NS } from "Bitburner";
import { ProgramData } from "utils/ProgramData";

export function nuke(ns: NS, target: string) {
  const programs = new ProgramData(ns);
  for (const p of programs.programs) {
    if (p.exists) p.execute(target);
  }
  ns.nuke(target);
}
