import { NS } from "Bitburner";

export function getFolio(ns: NS) {
  const symbols = ns.stock.getSymbols();
  let folio: { sym: string; shares: number }[] = [];
  for (const sym of symbols) {
    const [shares] = ns.stock.getPosition(sym);
    if (shares > 0) {
      folio.push({ sym, shares });
    }
  }
  return folio;
}
