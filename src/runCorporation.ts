import { NS } from "Bitburner";

const corporationName = "Grillbrick Studios";

export async function main(ns: NS) {
  await runCorporation(ns);
}
async function runCorporation(ns: NS) {
  ns.corporation.createCorporation(corporationName, false);
  ns.corporation.unlockUpgrade("OfficeAPI");
  ns.corporation.unlockUpgrade("WarehouseAPI");
}
