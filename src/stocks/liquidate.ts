import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.kill("/stocks/daemon.js", "home");
  let stocks: string[] = ns.stock.getSymbols();
  ns.tprint("Liquidating assets.");
  let total = 0;
  for (let stock of stocks) {
    let longOrders = ns.stock.getPosition(stock)[0];
    if (longOrders === 0) continue;
    if (longOrders > 0) {
      total += ns.stock.sell(stock, longOrders);
    }
  }
  ns.tprint(`All stocks sold for a total of ${total}`);
}
