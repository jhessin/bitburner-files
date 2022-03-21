import { NS } from "Bitburner";

// The time to sample to find how long before we reach our goal.
// The larger this number the more time you need to wait for an estimate.
// But the more accurate that estimate will be.
const deltaTimeSample = 1 * 60e3;

export async function main(ns: NS) {
  const args = ns.flags([
    ["help", false],
    ["company", "MegaCorp"],
    ["position", "Business"],
    ["goal", 0],
  ]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  const { help, goal } = args;
  if (help) {
    ns.tprint(`
      This script will generate money by working for the provided company (default MegaCorp)
      doing the given job (default Business) until you reach the given goal (default 0=indefinite).
      You will not be able to do anything else while this is happening.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.

      You can also provide a 'goal' in cash and will stop working once that is achieved.
      USAGE: run ${ns.getScriptName()} [--goal=CASH_AMOUNT] [--company="COMPANY_NAME"] [--position="POSITION_NAME"]
      `);
    return;
  }
  ns.disableLog("ALL");
  ns.enableLog("workForCompany");
  ns.clearLog();

  const company = args.company.trim('"');
  const position = args.position.trim('"');

  // work at joes guns on a loop.
  while (goal === 0 || ns.getServerMoneyAvailable("home") < goal) {
    await ns.sleep(300);
    ns.tail();
    ns.clearLog();
    ns.print(
      `Working at ${company} until we have ${ns.nFormat(goal, "$0.00a")}`
    );
    if (!ns.isBusy()) {
      // apply to work or for promotion.
      ns.applyToCompany(company, position);
      ns.workForCompany(company, false);
    }
  }
}

export function autocomplete() {
  return ['--goal="', '--company="', '--position="'];
}
