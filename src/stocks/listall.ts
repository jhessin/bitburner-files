// % of money to use in buying stocks
// const budget = 1;
// % at which to buy or sell stocks
// const buyAt = 60;

import { NS } from "Bitburner";

// Profit amount to sell the stock at.
// const sellAt = 10000000;

// TODO short stocks
// const shortAt = 40;
/** @param {NS} ns **/
export async function main(ns: NS) {
  let stocks: string[] = ns.stock.getSymbols();
  for (let stock of stocks.sort(
    (a, b) => ns.stock.getAskPrice(b) - ns.stock.getAskPrice(a)
  )) {
    // let increaseChance = ns.stock.getForecast(stock) * 100;
    let askPrice = ns.stock.getAskPrice(stock);
    ns.tprint(`${stock} - ${ns.nFormat(askPrice, "$0.0a")}`);
  }
}
