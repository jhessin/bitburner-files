import { NS } from "Bitburner";

export async function main(ns: NS) {
  await commitCrime(
    ns,
    (ns.args[0] as string) || "homicide",
    (ns.args[1] as number) || 0
  );
}

const crimes = [
  "heist",
  "assassinate",
  "kidnap",
  "grand theft auto",
  "homicide",
  "traffick illegal arms",
  "bond forgery",
  "deal drugs",
  "larceny",
  "mug",
  "rob store",
  "shoplift",
  //
];

export async function commitCrime(
  ns: NS,
  crime: string | undefined = undefined,
  goal: number = 0
) {
  if (!crime) crime = getBestCrime(ns);
  while (true) {
    ns.disableLog("ALL");
    ns.enableLog("commitCrime");
    ns.tail();
    if (!ns.singularity.isBusy()) {
      ns.print(`Crime until ${ns.nFormat(goal, "$0.0a")}`);
      ns.print(
        `Hacking Income     : ${ns.nFormat(
          ns.getScriptIncome()[0],
          "$0.0a"
        )} / sec`
      );
      ns.singularity.commitCrime(crime);
    }
    if (ns.getServerMoneyAvailable("home") >= goal) return;
    await ns.sleep(1);
  }
}

// function timeToGoal(ns: NS, goal: number) {
//   // calculate the time until the goal in seconds.
//   const startingCash = ns.getServerMoneyAvailable("home");
//   const neededCash = goal - startingCash;
//   if (neededCash < 0) return 0;
//   return (neededCash / (ns.getScriptIncome()[0] || 0.01)) * 200;
// }

function getBestCrime(ns: NS): string {
  return crimes.sort(
    (a, b) => crimeCashValue(ns, b) - crimeCashValue(ns, a)
  )[0];
}

// This gives the cash value of a crime taking in to account the chance of
// success as well as the time taken.
function crimeCashValue(ns: NS, crime: string) {
  const chance = ns.singularity.getCrimeChance(crime);
  const stats = ns.singularity.getCrimeStats(crime);
  const cash = ns.getBitNodeMultipliers().CrimeMoney * stats.money;

  return (cash * chance) / stats.time ** 2 + 1 / stats.time ** 2;
}
