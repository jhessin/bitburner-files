import { NS } from "Bitburner";
import { getFolio } from "stocks/folio";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.tail();
  ns.print("Liquidating assets.");
  await liquidate(ns);
}

export async function liquidate(ns: NS) {
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
  let folio = getFolio(ns);
  let total = 0;
  while (folio.length > 0) {
    ns.scriptKill("/stocks/start.js", "home");
    await ns.sleep(1);
    ns.clearLog();
    for (const stock of folio) {
      const forecast = ns.stock.getForecast(stock.sym);
      if (forecast < 0.5) {
        // SELL!
        const sellPrice = ns.stock.sell(stock.sym, stock.shares);
        total += sellPrice;
        ns.print(`
          ${stock.sym} sold for ${sellPrice}
          `);
      } else {
        ns.print(`
          Waiting for ${stock.sym} to stop growing.
          `);
      }
    }
    folio = getFolio(ns);
  }
  ns.print(`All stocks sold for a total of ${total}`);
}
