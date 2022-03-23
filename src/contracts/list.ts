import { NS, Server } from "Bitburner";
import { ServerTree } from "utils/ServerTree";

const minuteInterval = 2;

function getAllServers(ns: NS): Server[] {
  const tree = new ServerTree(ns);
  return tree.home.list();
}

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  const ram = ns.getScriptRam(ns.getScriptName()) * 1e9;
  if (args.help) {
    ns.tprint(`
      This script will automatically list contracts that it finds on the network.

      This script uses ${ns.nFormat(ram, "0.000b")} of RAM.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }
  let contracts: string[];
  function refreshLog() {
    ns.clearLog();
    ns.tail();
    ns.print("Contracts");
    ns.print("=========");
    for (const c of contracts) ns.print(c);
    ns.print("=========");
  }
  while (true) {
    // await dfs(ns, null, "home", trySolveContracts, 0);
    contracts = getAllServers(ns).flatMap((server) => {
      const onServer = ns.ls(server.hostname, ".cct").map((contract) => {
        const type = ns.codingcontract.getContractType(
          contract,
          server.hostname
        );
        return `${server.hostname} - ${contract} - ${type}`;
      });
      return onServer;
    });
    if (contracts.length > 0) refreshLog();
    await ns.sleep(minuteInterval * 60 * 1000);
  }
}
