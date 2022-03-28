import { NS } from "Bitburner";

export function hasSourceFile(ns: NS, n: number) {
  return (
    ns
      .getOwnedSourceFiles()
      .map((sf) => sf.n)
      .includes(n) || ns.getPlayer().bitNodeN === n
  );
}
