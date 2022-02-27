import { NS } from "Bitburner";

// % of money to use in buying stocks
const budget = 0.9;
// % at which to buy or sell stocks
const buyAt = 0.6;
const sellBellow = 0.5;

const stockToWatch = "MGCP"; // Megacorp

// TODO short stocks
// const shortAt = 40;
export async function main(ns: NS) {
  while (true) {
    manageStock(ns);
    await ns.sleep(1000);
  }
}

/** @param {number} n */
function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 5,
    notation: "compact",
    compactDisplay: "short",
  });
}

function formatNumber(n: number) {
  return n.toLocaleString(undefined, {
    maximumSignificantDigits: 5,
    notation: "compact",
    compactDisplay: "short",
  });
}

/** @param {NS} ns **/
function manageStock(ns: NS) {
  let stock = stockToWatch;
  let increaseChance = ns.stock.getForecast(stock);
  let longOrders = ns.stock.getPosition(stock)[0];
  let maxShares = getMaxShares(ns, stock);

  if (longOrders > 0) {
    if (increaseChance <= sellBellow) {
      let total = ns.stock.sell(stock, longOrders);
      ns.tprint(`${formatCurrency(
        longOrders
      )} of ${stock} sold for a total of ${formatCurrency(total * longOrders)} 
                    because it's growth is stopping.`);
    }
  } else if (increaseChance >= buyAt && longOrders < maxShares) {
    let cost = ns.stock.buy(stock, maxShares);
    ns.tprint(`${formatNumber(
      maxShares
    )} shares of ${stock} purchased for a total of ${formatCurrency(
      cost * maxShares
    )}
                because it has a ${increaseChance.toLocaleString(undefined, {
                  style: "percent",
                })}% chance of increasing.`);
  }
}

function getMaxShares(ns: NS, sym: string) {
  let cashAvailable = ns.getServerMoneyAvailable("home") * budget;
  let stockCost = ns.stock.getBidPrice(sym);
  let maxPurchaseable = Math.min(
    ns.stock.getMaxShares(sym),
    cashAvailable / stockCost
  );
  return maxPurchaseable;
}
