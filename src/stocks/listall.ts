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
  for (let stock of stocks) {
    let increaseChance = ns.stock.getForecast(stock) * 100;
    ns.tprint(
      `${stock} - ${increaseChance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}%`
    );
  }
}
