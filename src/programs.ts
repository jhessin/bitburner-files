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

// Returns true if a program is being created.
export async function createPrograms(ns: NS): Promise<boolean> {
  const data = new ProgramData(ns);

  if (ns.singularity.purchaseTor()) {
    for (const program of data.programs.filter((p) => !p.exists)) {
      ns.singularity.purchaseProgram(program.filename);
    }
  }

  let neededPrograms: string[] = [];
  for (const program of data.programs) {
    if (!program.exists) neededPrograms.push(program.filename);
    else continue;

    if (program.hackingLevel <= ns.getHackingLevel()) {
      // this program needs created.
      if (!program.exists) {
        return await createProgram(ns, program.filename);
      }
    }
  }

  return false;
}
