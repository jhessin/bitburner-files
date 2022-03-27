import { NS } from "Bitburner";
import { ProgramData } from "utils/ProgramData";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This monitors for programs that need created and creates the program if
      you have Source File 4. If not it prompts the user to create the program.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  ns.disableLog("ALL");

  const data = new ProgramData(ns);

  while (true) {
    await ns.sleep(30 * 1000);
    ns.clearLog();
    for (const program of data.programs) {
      if (!program.exists && program.hackingLevel <= ns.getHackingLevel()) {
        // this program needs created.
        if (
          ns
            .getOwnedSourceFiles()
            .map((s) => s.n)
            .includes(4) ||
          ns.getPlayer().bitNodeN === 4
        ) {
          // we have source file 4 or we are in bitNodeN 4
          if (!ns.scriptRunning("/actions/programming.js", ns.getHostname()))
            ns.run("/actions/programming.js", 1, program.filename);
        } else {
          // we don't have access to singularity.
          ns.tail();
          ns.print(`Please create ${program.filename}`);
        }
      }
    }
  }
}
