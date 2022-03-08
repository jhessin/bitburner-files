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
  // ns.enableLog("commitCrime");

  function getCommitableCrimes() {
    const result: iCrime[] = [];
    for (const crime of crimes) {
      const stats = ns.getCrimeStats(crime);
      const time = stats.time / 1000;

      result.push({
        name: crime,
        profit: stats.money / time,
        hackGrowth: stats.hacking_exp / time,
        strGrowth: stats.strength_exp / time,
        defGrowth: stats.defense_exp / time,
        dexGrowth: stats.dexterity_exp / time,
        agiGrowth: stats.agility_exp / time,
        chaGrowth: stats.charisma_exp / time,
        successChance: ns.getCrimeChance(crime),
      });
    }
    return result.filter((c) => c.successChance >= 1);
  }

  function crimeBreakdown() {
    let commitableCrimes = getCommitableCrimes();
    ns.print(`
      There are ${commitableCrimes.length} crimes that you can commit right now with 100% chance of success.
      `);
    for (const crime of commitableCrimes) {
      const combatGrowth =
        crime.strGrowth + crime.defGrowth + crime.dexGrowth + crime.agiGrowth;
      ns.print(
        `${crime.name}:
          ${ns.nFormat(crime.profit, "$0.000a")}/sec profit
          ${ns.nFormat(crime.hackGrowth, "0.000a")} hacking/sec
          ${ns.nFormat(combatGrowth, "0.000a")} combatGrowth/sec
          ${ns.nFormat(crime.chaGrowth, "0.000a")} charisma/sec`
      );
    }
  }

  function mostProfitableCrime() {
    const crimes = getCommitableCrimes();
    let best: iCrime | undefined;
    for (const crime of crimes) {
      if (!best || best.profit < crime.profit) {
        best = crime;
      }
    }
    return best;
  }

  function bestHackingXp() {
    const crimes = getCommitableCrimes();
    let best: iCrime | undefined;
    for (const crime of crimes) {
      if (!best || best.hackGrowth < crime.hackGrowth) {
        best = crime;
      }
    }
    return best;
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
    return best;
  }

  let bestCrime: iCrime | undefined;
  while (true) {
    if (getCommitableCrimes().length < crimes.length) {
      const newBest =
        bestCombatXp() || bestHackingXp() || mostProfitableCrime();
      if (newBest?.name !== bestCrime?.name) {
        bestCrime = newBest;
        crimeBreakdown();
      }
    } else if (ns.getServerMaxRam("home") < 2 ** 30) {
      const newBest =
        mostProfitableCrime() || bestHackingXp() || bestCombatXp();
      if (newBest?.name !== bestCrime?.name) {
        bestCrime = newBest;
        crimeBreakdown();
      }
    } else {
      const newBest =
        bestHackingXp() || bestCombatXp() || mostProfitableCrime();
      if (newBest?.name !== bestCrime?.name) {
        bestCrime = newBest;
        crimeBreakdown();
      }
    }

    // If we aren't busy commit the crime.
    if (!ns.isBusy()) {
      ns.commitCrime(bestCrime ? bestCrime.name : "Shoplift");
    }

    // Always update the server if we can.
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeRamCost()) {
      ns.upgradeHomeRam();
    }
    if (ns.getServerMoneyAvailable("home") >= ns.getUpgradeHomeCoresCost()) {
      ns.upgradeHomeCores();
    }
    ns.tail();
    await ns.sleep(3000);
  }
}
