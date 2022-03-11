import { NS } from "Bitburner";

interface iCompany {
  name: string;
  position: string;
}

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
  const companies: iCompany[] = [
    {
      name: "MegaCorp",
      position: "Security",
    },
    {
      name: "Alpha Enterprises",
      position: "Business",
    },
    {
      name: "Universal Energy",
      position: "Business",
    },
    {
      name: "Icarus Microsystems",
      position: "Business",
    },
    {
      name: "Blade Industries",
      position: "Security",
    },
    {
      name: "Central Intelligence Agency",
      position: "Security",
    },
    {
      name: "Carmichael Security",
      position: "Security",
    },
    {
      name: "DeltaOne",
      position: "Security",
    },
    {
      name: "Four Sigma",
      position: "Security",
    },
    {
      name: "National Security Agency",
      position: "Security",
    },
    {
      name: "FoodNStuff",
      position: "Part-time Waiter",
    },
    {
      name: "Joe's Guns",
      position: "Part-time Employee",
    },
  ];
  const employers: iCompany[] = [];
  while (true) {
    for (const company of companies) {
      if (ns.applyToCompany(company.name, company.position)) {
        if (!employers.includes(company)) employers.push(company);
        if (!ns.isBusy()) ns.workForCompany(company.name);
        break;
      }
      await ns.sleep(1);
    }
    if (!ns.isBusy()) {
      for (const company of employers) {
        if (ns.applyToCompany(company.name, company.position)) {
          if (!employers.includes(company)) employers.push(company);
          ns.workForCompany(company.name);
          break;
        }
        await ns.sleep(1);
      }
    }
    if (!ns.isBusy()) {
      for (const crime of crimes) {
        if (ns.getCrimeChance(crime) > 0.9 && !ns.isBusy()) {
          ns.commitCrime(crime);
          break;
        }
        await ns.sleep(1);
      }
    }
    // if (!ns.isBusy()) {
    //   ns.commitCrime("Shoplift");
    // }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeRamCost()) {
      ns.upgradeHomeRam();
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeCoresCost()) {
      ns.upgradeHomeCores();
    }
    await ns.sleep(3000);
  }
}
