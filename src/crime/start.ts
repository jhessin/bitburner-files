import { NS } from "Bitburner";
import { crimes, iCrime } from "consts";

// The time to sample to find how long before we reach our goal.
// The larger this number the more time you need to wait for an estimate.
// But the more accurate that estimate will be.
const deltaTimeSample = 1 * 60e3;

export async function main(ns: NS) {
  const args = ns.flags([
    ["help", false],
    ["goal", 0],
  ]);
  const crimeName = args._.join(" ");
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  const { help, goal } = args;
  if (help) {
    ns.tprint(`
      This script will generate money by commiting crimes.
      You will not be able to do anything else while this is happening.
      The log will automatically pop up so you can kill the script at
      any time. You may optionally provide a crime name to focus on that particular crime.
      Otherwise the best money making crime that can reasonably be accomplished will be chosen.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.

      You can also provide a 'goal' in cash and crime will stop once that is achieved.
      USAGE: run ${ns.getScriptName()} --goal=[CASH_AMOUNT] [CRIME_NAME]
      `);
    return;
  }
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  ns.enableLog("commitCrime");

  function getCrimeData(crime: string): iCrime {
    const stats = ns.getCrimeStats(crime);
    const time = stats.time;

    return {
      name: crime,
      profit: (stats.money / time) * 1000,
      hackGrowth: (stats.hacking_exp / time) * 1000,
      strGrowth: (stats.strength_exp / time) * 1000,
      defGrowth: (stats.defense_exp / time) * 1000,
      dexGrowth: (stats.dexterity_exp / time) * 1000,
      agiGrowth: (stats.agility_exp / time) * 1000,
      chaGrowth: (stats.charisma_exp / time) * 1000,
      successChance: ns.getCrimeChance(crime),
    };
  }

  function getAllCrimeData() {
    const result: iCrime[] = [];
    for (const crime of crimes) {
      result.push(getCrimeData(crime));
    }
    return result;
  }

  function getCommitableCrimes() {
    return getAllCrimeData().filter(
      (c) =>
        // either there is 100% chance of success
        c.successChance >= 1 ||
        // Or the the attempt takes less than a minute and there is at least a 50%
        // success rate.
        (ns.getCrimeStats(c.name).time < 60000 && c.successChance > 0.5)
    );
  }
  let deltaTimeStart = Date.now();
  let deltaCashStart = ns.getServerMoneyAvailable("home");
  let deltaTime = 0;
  let deltaCash = 0;
  let cashPerMs = 0;

  function resetTimer() {
    deltaTime = Date.now() - deltaTimeStart;
    deltaCash = ns.getServerMoneyAvailable("home") - deltaCashStart;
    if (cashPerMs !== 0) {
      cashPerMs = (cashPerMs + deltaCash / deltaTime) / 2;
    } else {
      cashPerMs = deltaCash / deltaTime;
    }
    deltaTimeStart = Date.now();
    deltaCashStart = ns.getServerMoneyAvailable("home");
  }

  function crimeBreakdown(crimeString: string) {
    const crime = getCrimeData(crimeString);
    const combatGrowth =
      crime.strGrowth + crime.defGrowth + crime.dexGrowth + crime.agiGrowth;
    if (goal > 0) {
      let timeToGoal: number | undefined;
      if (Date.now() - deltaTimeStart >= deltaTimeSample) {
        resetTimer();
      }
      if (cashPerMs > 0) {
        timeToGoal = (goal - ns.getServerMoneyAvailable("home")) / cashPerMs;
      }
      ns.print(
        `
Commiting '${crime.name}' until you have ${ns.nFormat(goal, "$0.00a")}
${ns.nFormat(ns.getServerMoneyAvailable("home") / goal, "0.00%")} complete.
Estimated Time to Completion: ${
          timeToGoal ? ns.tFormat(timeToGoal) : "Calculating..."
        }
      `
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
    return best?.name;
  }

  const easiestCrime = "Shoplift";
  if (crimeName) {
    if (crimes.includes(crimeName)) {
      if (ns.isBusy()) ns.stopAction();
      resetTimer();
      while (ns.getServerMoneyAvailable("home") < goal || !goal) {
        ns.tail();
        ns.clearLog();
        crimeBreakdown(crimeName);
        if (!ns.isBusy()) ns.commitCrime(crimeName);
        await ns.sleep(ns.getCrimeStats(crimeName).time + 3000);
      }
    } else
      ns.tprint(
        `${crimeName} is not a crime! You can use autocomplete to enter a crime name.`
      );
  } else {
    const crime = mostProfitableCrime() || easiestCrime;
    if (ns.isBusy()) ns.stopAction();
    resetTimer();
    while (ns.getServerMoneyAvailable("home") < goal || !goal) {
      ns.clearLog();
      ns.tail();
      crimeBreakdown(crime);
      if (!ns.isBusy()) ns.commitCrime(crime);
      await ns.sleep(ns.getCrimeStats(crime).time + 3000);
    }
  }
}

export function autocomplete() {
  return [...crimes, "--goal"];
}
