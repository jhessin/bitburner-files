import { NS } from "Bitburner";

export function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString(undefined, {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  });
}

export function formatPercent(n: number) {
  return n.toLocaleString(undefined, {
    style: "percent",
  });
}

export function getFolio(ns: NS): {
  sym: string;
  shares: number;
}[] {
  let folio: {
    sym: string;
    shares: number;
  }[] = [];
  for (const sym of ns.stock.getSymbols()) {
    let shares = ns.stock.getPosition(sym)[0];

    if (shares > 0) {
      folio.push({
        sym,
        shares,
      });
    }
  }
  return folio;
}
