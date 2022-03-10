import { NS } from "Bitburner";

interface iCrime {
  name: string;
  profit: number;
  hackGrowth: number;
  strGrowth: number;
  defGrowth: number;
  dexGrowth: number;
  agiGrowth: number;
  chaGrowth: number;
  successChance: number;
}
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

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  ns.enableLog("commitCrime");

  function getCrimeData(crime: string): iCrime {
    const stats = ns.getCrimeStats(crime);
    const time = stats.time / 1000;

    return {
      name: crime,
      profit: stats.money / time,
      hackGrowth: stats.hacking_exp / time,
      strGrowth: stats.strength_exp / time,
      defGrowth: stats.defense_exp / time,
      dexGrowth: stats.dexterity_exp / time,
      agiGrowth: stats.agility_exp / time,
      chaGrowth: stats.charisma_exp / time,
      successChance: ns.getCrimeChance(crime),
    };
  }

  function getAllCrimes() {
    const result: iCrime[] = [];
    for (const crime of crimes) {
      result.push(getCrimeData(crime));
    }
    return result;
  }

  function getCommitableCrimes() {
    return getAllCrimes().filter(
      (c) =>
        // either there is 100% chance of success
        c.successChance >= 1 ||
        // Or the the attempt takes less than a minute and there is at least a 50%
        // success rate.
        (ns.getCrimeStats(c.name).time < 60000 && c.successChance > 0.5)
    );
  }

  function crimeBreakdown(crimeString: string) {
    const crime = getCrimeData(crimeString);
    const combatGrowth =
      crime.strGrowth + crime.defGrowth + crime.dexGrowth + crime.agiGrowth;
    ns.print(
      `${crime.name}: ${ns.nFormat(crime.successChance, "0.00%")}
        hacking XP/sec: ${ns.nFormat(crime.hackGrowth, "0.000a")}
        combat XP/sec: ${ns.nFormat(combatGrowth, "0.000a")}
        profit: ${ns.nFormat(crime.profit, "$0.000a")}/sec`
    );
  }

  function mostProfitableCrime() {
    const crimes = getCommitableCrimes();
    let best: iCrime | undefined;
    for (const crime of crimes) {
      if (!best || best.profit < crime.profit) {
        best = crime;
      }
    }
    return best?.name;
  }

  function bestHackingXp() {
    const crimes = getCommitableCrimes();
    let best: iCrime | undefined;
    for (const crime of crimes) {
      if (!best || best.hackGrowth < crime.hackGrowth) {
        best = crime;
      }
    }
    return best?.name;
  }

  function bestCombatXp() {
    const crimes = getCommitableCrimes();
    let best: iCrime | undefined;
    for (const crime of crimes) {
      const bestGrowth = !best
        ? 0
        : best.strGrowth + best.defGrowth + best.dexGrowth + best.agiGrowth;
      const crimeGrowth =
        crime.strGrowth + crime.defGrowth + crime.dexGrowth + crime.agiGrowth;
      if (!best || bestGrowth < crimeGrowth) {
        best = crime;
      }
    }
    return best?.name;
  }

  const easiestCrime = "Shoplift";
  // if (getCommitableCrimes().length < crimes.length) {
  //   ns.stopAction();
  //   while (getCommitableCrimes().length < crimes.length) {
  //     ns.tail();
  //     const bestCrime = bestCombatXp() || easiestCrime;
  //     ns.print(
  //       `You haven't unlocked all the crimes yet so we will focus on combat XP.`
  //     );
  //     crimeBreakdown(bestCrime);
  //     await ns.sleep(3000);
  //     // await workForFaction();
  //     if (getCommitableCrimes().length < crimes.length) {
  //       ns.clearLog();
  //       if (!ns.isBusy()) ns.commitCrime(bestCrime);
  //     }
  //     joinFactions();
  //   }
  // } else
  if (ns.getServerMaxRam("home") < 2 ** 30) {
    ns.stopAction();
    while (ns.getServerMaxRam("home") < 2 ** 30) {
      ns.tail();
      const bestCrime = mostProfitableCrime() || easiestCrime;
      ns.print(
        `You haven't maxed out your ram yet so we will focus on money until then.`
      );
      crimeBreakdown(bestCrime);
      await ns.sleep(ns.getCrimeStats(bestCrime).time + 3000);
      ns.clearLog();
      if (!ns.isBusy()) ns.commitCrime(bestCrime);
      // Always update the server if we can.
      if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeRamCost()) {
        ns.upgradeHomeRam();
      }
      if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeCoresCost()) {
        ns.upgradeHomeCores();
      }
    }
  } else {
    ns.stopAction();
    while (true) {
      ns.tail();
      const bestCrime =
        mostProfitableCrime() ||
        bestHackingXp() ||
        bestCombatXp() ||
        easiestCrime;
      ns.print(
        `Okay - you've maxed your pc! Still focusing on money because that is the best use of crime!
      The best hacking XP would be ${bestHackingXp()} though.
      `
      );
      crimeBreakdown(bestCrime);
      await ns.sleep(ns.getCrimeStats(bestCrime).time + 3000);
      ns.clearLog();
      if (!ns.isBusy()) ns.commitCrime(bestCrime);
    }
  }
}
