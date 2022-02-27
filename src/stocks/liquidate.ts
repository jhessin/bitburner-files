import { NS } from "Bitburner";
import { getFolio, formatCurrency } from "stocks/daemon";

export async function main(ns: NS) {
  ns.scriptKill("/stocks/daemon.js", "home");
  ns.tprint("Liquidating assets.");
  let total = 0;
  const folio = getFolio(ns);
  for (const { sym, shares } of folio) {
    ns.tprint(`Waiting for ${sym} to stop growing.`);
    while (ns.stock.getPosition(sym)[0] > 0) {
      let increaseChance = ns.stock.getForecast(sym);
      if (increaseChance <= 0.5) {
        let stockPrice = ns.stock.sell(sym, shares);
        ns.tprint(`${formatCurrency(
          shares
        )} of ${sym} sold for a total of ${formatCurrency(stockPrice * shares)} 
                    because it's growth is stopping.`);
        total += stockPrice * shares;
      } else {
        await ns.sleep(1);
      }
    }
  }
  ns.tprint(`All stocks sold for a total of ${total}`);
}
