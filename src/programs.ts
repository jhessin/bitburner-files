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
    let neededPrograms: string[] = [];
    for (const program of data.programs) {
      if (!program.exists) neededPrograms.push(program.filename);
      else continue;

      if (program.hackingLevel <= ns.getHackingLevel()) {
        // this program needs created.
        if (!ns.scriptRunning("/actions/programming.js", ns.getHostname()))
          ns.run("/actions/programming.js", 1, program.filename);
      }
    }

    if (neededPrograms.length === 0) return;
    else {
      ns.print(`Need these programs:
        ${neededPrograms.join("\n")}`);
    }
  }
}
