import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.tprint(`
    CyberSec: ${ns.nFormat(ns.getFactionRep("CyberSec"), "000.000a")}
    Sector-12: ${ns.nFormat(ns.getFactionRep("Sector-12"), "000.000a")}
    `);
}
