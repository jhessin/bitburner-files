import { NS } from "Bitburner";

export async function main(ns: NS) {
  const crimes = [
    "Heist",
    "Assassination",
    "Kidnap",
    "Grand Theft Auto",
    "Homicide",
    "Traffick Arms",
    "Bond Forgery",
    "Deal Drugs",
    "Larceny",
    "Mug",
    "Rob Store",
    "Shoplift",
  ];
  while (true) {
    for (const crime of crimes) {
      if (ns.getCrimeChance(crime) > 0.9) {
        ns.commitCrime(crime);
        break;
      }
    }
    if (!ns.isBusy()) {
      ns.commitCrime("Shoplift");
    }
    await ns.sleep(2000);
  }
}
