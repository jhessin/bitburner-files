import { NS } from "Bitburner";
import { crimes, iCrime } from "consts";

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

  function crimeBreakdown(crimeString: string) {
    const crime = getCrimeData(crimeString);
    const combatGrowth =
      crime.strGrowth + crime.defGrowth + crime.dexGrowth + crime.agiGrowth;
    if (goal > 0) {
      ns.print(
        `
Commiting '${crime.name}' until you have ${ns.nFormat(goal, "$0.00a")}
${ns.nFormat(ns.getServerMoneyAvailable("home") / goal, "0.00%")} complete.
      `
      );
    }
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

  const easiestCrime = "Shoplift";
  if (crimeName) {
    if (crimes.includes(crimeName)) {
      if (ns.isBusy()) ns.stopAction();
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
