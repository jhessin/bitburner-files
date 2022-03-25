import { NS } from "Bitburner";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  const args = ns.flags([["help", false]]);
  if (args.help) {
    ns.tprint(`
      This will purchase the largest possible servers.

      USAGE: run ${ns.getScriptName()}
      `);
    return;
  }

  const ram = ns.getPurchasedServerMaxRam();
  const price = ns.getPurchasedServerCost(ram);

  while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    await ns.sleep(1000);
    ns.clearLog();
    ns.tail();
    const moneyAvailable = ns.getServerMoneyAvailable("home");
    if (moneyAvailable > price) {
      const serverName = `pserver-${Date.now()}`;
      ns.print(
        `Buying server ${serverName} for ${ns.nFormat(price, "$0.000a")}`
      );
      ns.purchaseServer(`pserver-${Date.now()}`, ram);
    } else {
      ns.print(
        `You need ${ns.nFormat(
          price,
          "$0.000a"
        )} to purchase a server with ${ns.nFormat(ram * 1e9, "0.000b")} of RAM`
      );
    }
  }
  ns.clearLog();
  ns.print("All servers have been purchased!");
}
