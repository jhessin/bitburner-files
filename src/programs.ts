import { NS } from "Bitburner";
import { ProgramData } from "utils/ProgramData";
import { createProgram } from "actions/programming";

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

  while (data.programs.filter((p) => !p.exists).length > 0) {
    ns.clearLog();
    await createPrograms(ns);
    await ns.sleep(1);
  }
}

export async function createPrograms(ns: NS) {
  const data = new ProgramData(ns);

  let neededPrograms: string[] = [];
  for (const program of data.programs) {
    if (!program.exists) neededPrograms.push(program.filename);
    else continue;

    if (program.hackingLevel <= ns.getHackingLevel()) {
      // this program needs created.
      while (!program.exists) {
        await createProgram(ns, program.filename);
      }
    }
  }

  if (neededPrograms.length === 0) return;

  if (ns.singularity.purchaseTor()) {
    for (const programName of neededPrograms) {
      ns.singularity.purchaseProgram(programName);
    }
  }
}
