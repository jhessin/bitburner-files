import { NS } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will have you study computer science with every free moment.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  const school = "Rothman University";
  const course = "Study Computer Science";

  while (true) {
    if (!ns.isBusy()) {
      ns.universityCourse(school, course, false);
    }
  }
}
