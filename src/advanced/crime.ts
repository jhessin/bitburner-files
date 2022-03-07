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
      if (ns.getCrimeChance(crime) > 0.9 && !ns.isBusy()) {
        ns.commitCrime(crime);
        break;
      }
      await ns.sleep(1);
    }
    if (!ns.isBusy()) {
      ns.commitCrime("Shoplift");
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeRamCost()) {
      ns.upgradeHomeRam();
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeCoresCost()) {
      ns.upgradeHomeCores();
    }
    await ns.sleep(30000);
  }
}
