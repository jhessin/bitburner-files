import { NS } from "Bitburner";

export async function main(ns: NS) {
  // TODO: purchasePricey Here //
  ns.singularity.applyToCompany("Joe's Guns", "Employee");
  ns.singularity.workForCompany("Joe's Guns");

  ns.spawn("phase1/prepare.js");
}
