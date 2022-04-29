import { NS } from "Bitburner";

export async function main(ns: NS) {
  await commitCrime(ns, ns.args[0] as number | 0, ns.args[1] as string);

  ns.spawn("/phase1/nuke.js");
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
  goal: number = 0,
  crime: string | undefined = undefined
) {
  if (!crime) crime = getBestCrime(ns);
  if (ns.singularity.isBusy()) return;
  while (true) {
    ns.disableLog("ALL");
    ns.enableLog("commitCrime");
    ns.tail();
    if (!ns.singularity.isBusy()) {
      ns.singularity.commitCrime(crime);
    }
    if (ns.getServerMoneyAvailable("home") >= goal) return;
    await ns.sleep(1);
  }
}

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
