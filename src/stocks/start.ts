import { NS } from "Bitburner";
import { getFolio } from "stocks/folio";

// % of money to use in buying stocks
const budget = 0.5;
// % at which to buy or sell stocks
const buyAt = 0.6;
const sellBellow = 0.5;
// const shortAt = 0.4;
// const sellShortAt = 0.5;

// const stockToWatch = "MGCP"; // Megacorp

// TODO short stocks
// const shortAt = 40;
export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  while (await manageStock(ns)) {
    if (getFolio(ns).length > 0) ns.tail();
    showFolio(ns);
    await ns.sleep(1);
  }
}

/** @param {NS} ns **/
export async function manageStock(ns: NS): Promise<boolean> {
  try {
    if (
      !ns.stock.purchaseWseAccount() ||
      !ns.stock.purchaseTixApi() ||
      !ns.stock.purchase4SMarketData() ||
      !ns.stock.purchase4SMarketDataTixApi()
    ) {
      return false;
    }
  } catch (error) {
    return false;
  }
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
  return true;
}

function buyStock(ns: NS, sym: string) {
  let cashAvailable = ns.getServerMoneyAvailable("home") * budget;
  let stockCost = ns.stock.getBidPrice(sym);
  let maxShares = ns.stock.getMaxShares(sym);
  let [ownedShares] = ns.stock.getPosition(sym);
  if (
    cashAvailable >= maxShares * stockCost &&
    ownedShares < ns.stock.getMaxShares(sym)
  ) {
    ns.stock.buy(sym, maxShares - ownedShares);
    let increaseChance = ns.stock.getForecast(sym);

    ns.print(
      `Bought:
        shares      : ${ns.nFormat(maxShares, "0.0a")}
        stock       : ${sym} 
        total       : ${ns.nFormat(stockCost * maxShares, "$0.0a")}
        increase%   : ${ns.nFormat(increaseChance, "0.0%")}
        `
    );
  }
}

function showFolio(ns: NS) {
  ns.clearLog();
  for (const { sym, shares } of getFolio(ns)) {
    let [_, avgPrice] = ns.stock.getPosition(sym);
    let invested = shares * avgPrice;
    let currentWorth = ns.stock.getBidPrice(sym) * shares;
    ns.print(
      `${sym}:
      shares          : ${ns.nFormat(shares, "0.0a")}
      invested        : ${ns.nFormat(invested, "$0.0a")}
      worth           : ${ns.nFormat(currentWorth, "$0.0a")}
      profit          : ${ns.nFormat(
        currentWorth - invested,
        "$0.0a"
      )}(${ns.nFormat((currentWorth - invested) / invested, "0.0%")})
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
