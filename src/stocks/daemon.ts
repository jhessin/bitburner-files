import { NS } from "Bitburner";

// % of money to use in buying stocks
const budget = 0.9;
// % at which to buy or sell stocks
const buyAt = 0.6;
const sellBellow = 0.5;

// const stockToWatch = "MGCP"; // Megacorp

// TODO short stocks
// const shortAt = 40;
export async function main(ns: NS) {
  while (true) {
    await manageStock(ns);
    await ns.sleep(1);
  }
}

/** @param {number} n */
export function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 5,
    notation: "compact",
    compactDisplay: "short",
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString(undefined, {
    maximumSignificantDigits: 5,
    notation: "compact",
    compactDisplay: "short",
  });
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
        ns.tprint(`${formatNumber(
          shares
        )} shares of ${sym} sold for a total of ${formatCurrency(
          total * shares
        )} 
                    because it's growth is stopping.`);
      } else {
        await ns.sleep(1);
      }
    }
  } else {
    // find a stock to get
    for (const stock of ns.stock.getSymbols()) {
      let increaseChance = ns.stock.getForecast(stock);
      let maxShares = getMaxShares(ns, stock);
      if (increaseChance >= buyAt && ns.stock.getPosition(stock)[0] === 0) {
        let cost = ns.stock.buy(stock, maxShares);
        ns.tprint(`${formatNumber(
          maxShares
        )} shares of ${stock} purchased for a total of ${formatCurrency(
          cost * maxShares
        )}
        because it has a ${increaseChance.toLocaleString(undefined, {
          style: "percent",
        })}% chance of increasing.`);
        break;
      }
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

}
