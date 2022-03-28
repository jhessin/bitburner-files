import { NS } from "Bitburner";
import { getFolio } from "stocks/folio";

export async function main(ns: NS) {
  ns.scriptKill("/stocks/start.js", "home");
  ns.disableLog("ALL");
  ns.tail();
  ns.print("Liquidating assets.");
  let total = 0;
  const folio = getFolio(ns);
  for (const { sym, shares } of folio) {
    ns.print(`Waiting for ${sym} to stop growing.`);
    while (ns.stock.getPosition(sym)[0] > 0) {
      let increaseChance = ns.stock.getForecast(sym);
      if (increaseChance <= 0.5) {
        let stockPrice = ns.stock.sell(sym, shares);
        ns.print(`${ns.nFormat(
          shares,
          "0.000a"
        )} of ${sym} sold for a total of ${ns.nFormat(
          stockPrice * shares,
          "$0.000a"
        )} 
                    because it's growth is stopping.`);
        total += stockPrice * shares;
      } else {
        await ns.sleep(1);
      }
    }
  }
  ns.print(`All stocks sold for a total of ${total}`);
}
