import { NS } from "Bitburner";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName());
  if (args.help) {
    ns.tprint(
      `This is the main conductor script for running all your automation:
      hacks, nukes, contracts, crimes, etc.`
    );
    ns.tprint("It requires no arguments so just run it!");
    ns.tprint(`It currently uses ${ns.nFormat(ram, "0.000b")} of RAM.`);
    ns.tprint(`USAGE: run ${ns.getScriptName()}`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()}`);
    return;
  }
  // Determine size of home PC.
  // Determine what scripts can run.
  // Run Appropriate scripts.
}
