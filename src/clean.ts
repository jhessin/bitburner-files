import { NS } from "Bitburner";

export async function main(ns: NS) {
  const files = ns.ls("home", ".js");

  ns.tprint(`Removing the following files:`);

  for (const file of files) {
    ns.tprint(`   ${file}`);
    ns.rm(file);
  }
}
