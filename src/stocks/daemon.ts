import { NS } from "Bitburner";

// % of money to use in buying stocks
const budget = 1;
// % at which to buy or sell stocks
const buyAt = 70;
const sellBellow = 60;

// Profit amount to sell the stock at.
const sellAt = 1000000000;

// TODO short stocks
// const shortAt = 40;
/** @param {NS} ns **/
export async function main(ns: NS) {
  while (true) {
    deamon(ns);
    await ns.sleep(6 * 1000);
  }
}

/** @param {number} n */
function formatNumber(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
    compactDisplay: "short",
  });
}

/** @param {NS} ns **/
function deamon(ns: NS) {
  let stocks: string[] = ns.stock.getSymbols();
  for (let stock of stocks) {
    let increaseChance = ns.stock.getForecast(stock) * 100;
    let longOrders = ns.stock.getPosition(stock)[0];
    let maxShares = getMaxShares(ns, stock);

    if (longOrders > 0) {
    }

    if (increaseChance >= buyAt && longOrders < maxShares) {
      let cost = ns.stock.buy(stock, maxShares);
      ns.tprint(`${formatNumber(
        maxShares
      )} shares of ${stock} purchased for a total of \$${formatNumber(cost)}
                because it has a ${increaseChance.toLocaleString(undefined, {
                  style: "percent",
                })}% chance of increasing.`);
    } else if (longOrders > 0) {
      let profit = ns.stock.getSaleGain(stock, maxShares, "Long");
      if (profit >= sellAt) {
        let total = ns.stock.sell(stock, longOrders);
        ns.tprint(`${formatNumber(
          longOrders
        )} of ${stock} sold for a total of \$${formatNumber(total)} 
                    because it's profit: \$${formatNumber(
                      profit
                    )} has reached target profit: \$${formatNumber(sellAt)}.`);
      } else if (increaseChance <= sellBellow) {
        let total = ns.stock.sell(stock, longOrders);
        ns.tprint(`${formatNumber(
          longOrders
        )} of ${stock} sold for a total of \$${formatNumber(total)} 
                    because it's growth is stopping.`);
      } else {
        ns.tprint(
          `Keeping ${stock} because it is still has a ${increaseChance.toLocaleString(
            undefined,
            {
              style: "percent",
            }
          )} chance of growing.`
        );
      }
    }
  }
}

function getMaxShares(ns: NS, sym: string) {
  let cashAvailable = ns.getServerMoneyAvailable("home") * (budget / 100);
  let stockCost = ns.stock.getAskPrice(sym);
  let maxPurchaseable = Math.min(
    ns.stock.getMaxShares(sym),
    cashAvailable / stockCost
  );
  return maxPurchaseable;
}
