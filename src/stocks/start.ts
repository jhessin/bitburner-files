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
  try {
    if (
      !ns.stock.purchase4SMarketData() ||
      !ns.stock.purchase4SMarketDataTixApi()
    ) {
      ns.tprint(
        "You need 4S Maket Data Api access to effectively trade stocks!"
      );
      return;
    }
  } catch (error) {
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
    for (const { sym, shares } of folio) {
      if (ns.stock.getPosition(sym)[0] > 0) {
        // we have stock in the long position
        let increaseChance = ns.stock.getForecast(sym);
        if (increaseChance <= sellBellow) {
          let total = ns.stock.sell(sym, shares);
          // ns.tail();
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
    }
  }

  // buy any stocks that are increasing that we can offord
  for (const sym of ns.stock.getSymbols()) {
    let increaseChance = ns.stock.getForecast(sym);
    if (increaseChance >= buyAt) {
      buyStock(ns, sym);
    }
  }
}

function buyStock(ns: NS, sym: string) {
  let cashAvailable = ns.getServerMoneyAvailable("home") * budget;
  let stockCost = ns.stock.getBidPrice(sym);
  let maxShares = ns.stock.getMaxShares(sym);
  if (cashAvailable >= maxShares * stockCost) {
    ns.stock.buy(sym, maxShares);
    let increaseChance = ns.stock.getForecast(sym);

    ns.print(
      `Bought:
        shares      : ${ns.nFormat(maxShares, "0.000a")}
        stock       : ${sym} 
        total       : ${ns.nFormat(stockCost * maxShares, "$0.000a")}
        increase%   : ${increaseChance.toLocaleString(undefined, {
          style: "percent",
        })}
        `
    );
  }
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
