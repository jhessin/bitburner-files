import { NS, AutocompleteData } from "Bitburner";
import { copyCmd } from "utils/terminal";
import { ServerTree } from "utils/ServerTree";

export async function main(ns: NS) {
  const args = ns.flags([["help", false]]);
  const target = args._[0];
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help || !target) {
    ns.tprint(`
      This script will connect you to any server regardless of location.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.
      USAGE: run ${ns.getScriptName()} TARGET_SERVER
      `);
    return;
  }

  let tree = new ServerTree(ns);

  let path = tree.home.find(target).map((name) => {
    if (name === "home") return "home;";
    else return `connect ${name};`;
  });
  copyCmd(ns, path.join("") + "backdoor;");
}

export function autocomplete(data: AutocompleteData, _args: string[]) {
  return data.servers;
}
