import { NS } from "Bitburner";
import { getFolio } from "stocks/folio";

// % of money to use in buying stocks
const budget = 0.9;
// % at which to buy or sell stocks
const buyAt = 0.6;
const sellBellow = 0.5;

// const stockToWatch = "MGCP"; // Megacorp

// TODO short stocks
// const shortAt = 40;
export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  if (!ns.stock.purchase4SMarketDataTixApi()) {
    ns.tprint("You need 4S Maket Data Api access to effectively trade stocks!");
    return;
  }
  while (true) {
    await manageStock(ns);
    await ns.sleep(1);
  }
}

/** @param {NS} ns **/
async function manageStock(ns: NS) {
  // let stock = stockToWatch;
  let folio = getFolio(ns);

  if (folio.length > 0) {
    // we have a stock - get it and monitor if it is increasing/decreasing
    let { sym, shares } = folio[0];
    while (ns.stock.getPosition(sym)[0] > 0) {
      let increaseChance = ns.stock.getForecast(sym);
      if (increaseChance <= sellBellow) {
        let total = ns.stock.sell(sym, shares);
        ns.tail();
        ns.print(
          `Sold:
        shares    : ${ns.nFormat(shares, "0.00a")} 
        stock     : ${sym}
        total     : ${ns.nFormat(total * shares, "$0.000a")} 
        increase%   : ${increaseChance.toLocaleString(undefined, {
          style: "percent",
        })}
          `
        );
      } else {
        await ns.sleep(1);
      }
    }
  } else {
    // find a stock to get
    const stock = getBestStock(ns);
    let increaseChance = ns.stock.getForecast(stock);
    let maxShares = getMaxShares(ns, stock);
    if (increaseChance >= buyAt) {
      let cost = ns.stock.buy(stock, maxShares);
      if (cost === 0) {
      }
      ns.tail();
      ns.print(
        `Bought:
        shares      : ${ns.nFormat(maxShares, "0.000a")}
        stock       : ${stock} 
        total       : ${ns.nFormat(cost * maxShares, "$0.000a")}
        increase%   : ${increaseChance.toLocaleString(undefined, {
          style: "percent",
        })}
        `
      );
    }
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

export function getBestStock(ns: NS): string {
  let best: [string, number] = ["", 0];
  for (const stock of ns.stock.getSymbols()) {
    let increaseChance = ns.stock.getForecast(stock);
    if (increaseChance > best[1]) {
      best = [stock, increaseChance];
    }
  }
  return best[0];
}
